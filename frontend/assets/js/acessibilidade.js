// acessibilidade.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado, iniciando acessibilidade...');

    // Selecionar os botões de acessibilidade
    const increaseFontBtn = document.getElementById('increaseFont');
    const decreaseFontBtn = document.getElementById('decreaseFont');
    const highContrastBtn = document.getElementById('highContrast');
    const readTextBtn = document.getElementById('readText');

    // Verificação de elementos
    console.log('Procurando elementos:', {
        increaseFontBtn: !!increaseFontBtn,
        decreaseFontBtn: !!decreaseFontBtn,
        highContrastBtn: !!highContrastBtn,
        readTextBtn: !!readTextBtn
    });

    // Aumentar e Diminuir Fonte
    let fontSizeLevel = 1;

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            fontSizeLevel = Math.min(fontSizeLevel + 0.2, 2);
            document.documentElement.style.fontSize = `${fontSizeLevel * 100}%`;
            console.log('Fonte aumentada para:', fontSizeLevel * 100 + '%');
        });
    } else {
        console.error('Botão increaseFont não encontrado');
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            fontSizeLevel = Math.max(fontSizeLevel - 0.2, 0.8);
            document.documentElement.style.fontSize = `${fontSizeLevel * 100}%`;
            console.log('Fonte reduzida para:', fontSizeLevel * 100 + '%');
        });
    } else {
        console.error('Botão decreaseFont não encontrado');
    }

    // Modo de Alto Contraste
    let isHighContrast = false;

    if (highContrastBtn) {
        highContrastBtn.addEventListener('click', () => {
            isHighContrast = !isHighContrast;
            document.body.classList.toggle('high-contrast', isHighContrast);
            highContrastBtn.innerHTML = `<i class="fas fa-adjust"></i> ${isHighContrast ? 'Desativar' : 'Ativar'} Alto Contraste`;
            console.log('Modo de alto contraste:', isHighContrast ? 'ativado' : 'desativado');
        });
    } else {
        console.error('Botão highContrast não encontrado');
    }

    // Leitura de Texto com Voz
    let isSpeaking = false;
    let utterance = null;
    let chunks = [];
    let chunkIndex = 0;

    if (readTextBtn) {
        readTextBtn.addEventListener('click', () => {
            console.log('Botão "Ler Texto" clicado, isSpeaking:', isSpeaking);

            if (isSpeaking) {
                console.log('Interrompendo leitura...');
                window.speechSynthesis.cancel();
                isSpeaking = false;
                readTextBtn.innerHTML = '<i class="fas fa-volume-up"></i> Ler Texto';
                chunks = [];
                chunkIndex = 0;
                return;
            }

            // Verificar suporte à API
            if (!window.speechSynthesis) {
                console.error('A API SpeechSynthesis não é suportada neste navegador.');
                readTextBtn.disabled = true;
                readTextBtn.innerHTML = '<i class="fas fa-volume-up"></i> Não suportado';
                return;
            }

            const selectedText = window.getSelection().toString().trim();
            const noticiaContent = document.querySelector('.noticia-info')?.innerText || 'Nenhum texto disponível para leitura.';
            const textToRead = selectedText || noticiaContent;

            if (!textToRead) {
                console.warn('Nenhum texto disponível para leitura.');
                return;
            }

            console.log('Tamanho total do texto a ser lido:', textToRead.length, 'caracteres');
            console.log('Texto a ser lido (primeiros 100 caracteres):', textToRead.substring(0, 100) + '...');

            // Divide o texto em partes menores
            const maxLength = 150; // 150 caracteres por chunk
            chunks = [];
            for (let i = 0; i < textToRead.length; i += maxLength) {
                chunks.push(textToRead.slice(i, i + maxLength));
            }

            console.log('Texto dividido em', chunks.length, 'chunks');

            chunkIndex = 0;
            isSpeaking = true;

            function speakNextChunk() {
                console.log('Chamando speakNextChunk, chunkIndex:', chunkIndex, 'isSpeaking:', isSpeaking);

                if (chunkIndex >= chunks.length || !isSpeaking) {
                    console.log('Leitura concluída ou interrompida.');
                    isSpeaking = false;
                    readTextBtn.innerHTML = '<i class="fas fa-volume-up"></i> Ler Texto';
                    return;
                }

                console.log(`Lendo chunk ${chunkIndex + 1} de ${chunks.length}, tamanho: ${chunks[chunkIndex].length} caracteres`);

                utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
                utterance.lang = 'pt-BR';
                utterance.rate = 1;
                utterance.pitch = 1;
                utterance.volume = 1;

                utterance.onend = () => {
                    console.log(`Chunk ${chunkIndex + 1} finalizado`);
                    if (isSpeaking) {
                        setTimeout(() => {
                            chunkIndex++;
                            speakNextChunk();
                        }, 300); // Pausa de 300ms entre chunks
                    }
                };

                utterance.onerror = (event) => {
                    console.error('Erro na síntese de voz:', event.error);
                    if (event.error === 'canceled' && isSpeaking) {
                        console.log('Tentando reiniciar leitura após cancelamento...');
                        setTimeout(() => {
                            if (isSpeaking) {
                                speakNextChunk();
                            }
                        }, 500);
                    } else {
                        isSpeaking = false;
                        readTextBtn.innerHTML = '<i class="fas fa-volume-up"></i> Ler Texto';
                    }
                };

                utterance.onboundary = (event) => {
                    console.log(`Boundary atingido no chunk ${chunkIndex + 1}:`, event.name, 'charIndex:', event.charIndex);
                };

                try {
                    console.log('Iniciando fala do chunk...');
                    window.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Erro ao iniciar a síntese de voz:', error);
                    isSpeaking = false;
                    readTextBtn.innerHTML = '<i class="fas fa-volume-up"></i> Ler Texto';
                }
            }

            // Inicia a leitura
            window.speechSynthesis.cancel(); // Garante que não há fala pendente
            console.log('Iniciando leitura com isSpeaking:', isSpeaking);
            speakNextChunk();
            readTextBtn.innerHTML = '<i class="fas fa-stop"></i> Parar Leitura';
            console.log('Leitura iniciada.');
        });
    } else {
        console.error('Botão readText não encontrado');
    }

    // Manter fala ativa ao mudar de foco
    window.addEventListener('blur', () => {
        if (isSpeaking) {
            console.log('Aba perdeu foco, tentando manter fala...');
            window.speechSynthesis.resume();
        }
    });

    window.addEventListener('focus', () => {
        if (isSpeaking) {
            console.log('Aba recuperou foco, retomando fala...');
            window.speechSynthesis.resume();
        }
    });

    // Captura erros globais
    window.addEventListener('error', (event) => {
        console.error('Erro global capturado:', event.message, event.filename, event.lineno);
    });
});