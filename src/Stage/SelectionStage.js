const SessionStage = require("./SessionStage");

class SelectionStage extends SessionStage {
    closeStage() {
        throw new Error("La sesión ya se encuentra en la etapa final de selección.");
    }

    obtenerArticulosOrdenadosPorScore() {
        const sortedPapers = [...this._session.papers()];
        sortedPapers.sort((a, b) => b.finalScore() - a.finalScore());
        return sortedPapers;
    }

    obtenerArticulosAceptados() {
        return this._session.acceptancePolicy().seleccionarArticulos(
            this._session.papers()
        );
    }
}

module.exports = SelectionStage;
