const loginForm = document.getElementById('login').addEventListener('submit', async (e) => {

    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email==='' || password==='') {
        alert("Champs manquants");
        return;
    }else{
        try {
            const response = await fetch('http://localhost:5678/api/users/login',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, password: password})});

            const data = await response.json();

            if (response.ok) {
                const token = data.token;
                if (token) {
                    localStorage.setItem('authToken',token);
                    window.location.href = 'index.html';
                }else{
                    alert('Erreur :  Token manquant');
                }
            } else if (response.status===401){
                alert('Mot de passe incorrect');
            }else if (response.status===404){
                alert('Utilisateur introuvable');
            }else{
                alert('Erreur : '+response.status);
            }
        } catch (error) {
            alert('Connexion au serveur impossible');
        }
    }
});
