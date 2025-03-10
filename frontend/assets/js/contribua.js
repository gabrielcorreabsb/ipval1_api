function copiarTexto(button) {
    const input = button.parentElement.querySelector('input');
    input.select();
    document.execCommand('copy');

    // Feedback visual
    Swal.fire({
        text: 'Texto copiado com sucesso!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// Atualizar ano no footer
document.getElementById('ano-atual').textContent = new Date().getFullYear();