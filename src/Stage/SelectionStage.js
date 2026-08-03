const SessionStage = require("./SessionStage");

class SelectionStage extends SessionStage {
    closeStage() {
        throw new Error("La sesión ya se encuentra en la etapa final de selección.");
    }

    obtenerArticulosOrdenadosPorScore() {
        const ordenados = [...this._Session.papers()];
        ordenados.sort((a, b) => b.finalScore() - a.finalScore());
        return ordenados;
    }

    obtenerArticulosAceptados() {
        return this._Session.acceptancePolicy().seleccionarArticulos(
            this._Session.papers()
        );
    }
}

module.exports = SelectionStage;
