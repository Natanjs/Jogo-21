// Criação do baralho com símbolos
const criarBaralho = () => {
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const naipes = ["♠", "♥", "♣", "♦"];
    return naipes.flatMap(naipe =>
        valores.map(valor => ({
            carta: `${valor}${naipe}`,
            valor: valor === "A" ? 11 : ["J", "Q", "K"].includes(valor) ? 10 : parseInt(valor)
        }))
    ).sort(() => Math.random() - 0.5); // Embaralha o baralho
};

// Cálculo do valor das cartas
const calcularValor = cartas => {
    const valores = cartas.map(carta => carta.valor);
    const soma = valores.reduce((acc, val) => acc + val, 0);
    const ases = valores.filter(val => val === 11).length;
    return soma > 21 && ases > 0
        ? calcularValor(cartas.slice(1).concat({ valor: 1 })) // Ajusta o valor do Ás
        : soma;
};

// Inicialização do jogo
const inicializarJogo = (placar = { jogador: 0, oponente: 0 }) => {
    const baralho = criarBaralho();
    return {
        baralho,
        jogador: { cartas: [baralho[0], baralho[2]] },
        oponente: { cartas: [baralho[1], baralho[3]] },
        status: "jogando",
        placar,
        indiceBaralho: 4
    };
};

// Jogador compra carta
const jogadorCompra = estado => {
    if (estado.status !== "jogando") return estado;
    const novaCarta = estado.baralho[estado.indiceBaralho];
    const novoJogador = { cartas: [...estado.jogador.cartas, novaCarta] };
    const pontos = calcularValor(novoJogador.cartas);
    return pontos > 21
        ? { ...estado, jogador: novoJogador, status: "perdeu" }
        : { ...estado, jogador: novoJogador, indiceBaralho: estado.indiceBaralho + 1 };
};

// Oponente joga (recursivo)
const oponenteJoga = estado => {
    if (estado.status !== "jogando") return estado;

    const pontosOponente = calcularValor(estado.oponente.cartas);
    if (pontosOponente >= 17) {
        return { ...estado, status: definirVencedor(estado) };
    }

    const novaCarta = estado.baralho[estado.indiceBaralho];
    const novoOponente = { cartas: [...estado.oponente.cartas, novaCarta] };
    const novoEstado = {
        ...estado,
        oponente: novoOponente,
        indiceBaralho: estado.indiceBaralho + 1
    };

    return oponenteJoga(novoEstado); // Chamada recursiva
};

// Definir vencedor
const definirVencedor = estado => {
    const pontosJogador = calcularValor(estado.jogador.cartas);
    const pontosOponente = calcularValor(estado.oponente.cartas);
    if (pontosJogador > 21) return "perdeu";
    if (pontosOponente > 21 || pontosJogador > pontosOponente) return "ganhou";
    if (pontosJogador === pontosOponente) return "empate";
    return "perdeu";
};

// Renderização das cartas com cor baseada no naipe
const renderizarCarta = (carta) => {
    const naipesVermelhos = ["♥", "♦"];
    const isRed = naipesVermelhos.includes(carta.carta.slice(-1)); // Verifica o último caractere (naipe)
    return `<div class="card" ${isRed ? 'data-red="true"' : ""}>${carta.carta}</div>`;
};

// Atualizar tela
const atualizarTela = (estado) => {
    document.getElementById("jogador-cartas").innerHTML = estado.jogador.cartas
        .map(renderizarCarta)
        .join("");
    document.getElementById("oponente-cartas").innerHTML = estado.oponente.cartas
        .map(renderizarCarta)
        .join("");
    document.getElementById("jogador-pontos").textContent = calcularValor(estado.jogador.cartas);
    document.getElementById("oponente-pontos").textContent = calcularValor(estado.oponente.cartas);
    document.getElementById("placar").textContent = `Jogador: ${estado.placar.jogador} | Oponente: ${estado.placar.oponente}`;
    document.getElementById("resultado").textContent =
        estado.status === "ganhou"
            ? "Você venceu!"
            : estado.status === "perdeu"
            ? "Você perdeu!"
            : estado.status === "empate"
            ? "Empate!"
            : "";
};

// Iniciar jogo
const iniciar = (estado = inicializarJogo()) => {
    atualizarTela(estado);

    document.getElementById("comprar").onclick = () => {
        const novoEstado = jogadorCompra(estado);
        iniciar(novoEstado);
    };

    document.getElementById("parar").onclick = () => {
        const novoEstado = oponenteJoga(estado);
        const novoPlacar = {
            jogador: novoEstado.status === "ganhou" ? estado.placar.jogador + 1 : estado.placar.jogador,
            oponente: novoEstado.status === "perdeu" ? estado.placar.oponente + 1 : estado.placar.oponente
        };
        iniciar({ ...novoEstado, placar: novoPlacar });
    };

    document.getElementById("reiniciar").onclick = () => iniciar(inicializarJogo(estado.placar));
};

// Inicializar o jogo
iniciar();