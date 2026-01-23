import { useEffect } from 'react';

const ChatWidget = () => {
    useEffect(() => {
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        (function () {
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            // SUBSTITUA AQUI PELO SEU LINK (ex: https://embed.tawk.to/65a.../default)
            s1.src = 'https://embed.tawk.to/6973f8914a0f82197e62106d/1jfmg5uk4';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    }, []);

    return null; // O widget é injetado no HTML, não renderiza nada visual aqui
};

export default ChatWidget;
