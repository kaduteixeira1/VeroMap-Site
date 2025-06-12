from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

# Dados da conexão com seu banco no Render
DB_CONFIG = {
    'dbname': 'seu_banco',
    'user': 'seu_usuario',
    'password': 'sua_senha',
    'host': 'seu_host.render.com',
    'port': '5432'
}

def salvar_ranking_no_banco(ranking):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        for jogador in ranking:
            cur.execute("""
                INSERT INTO jogadores (nome, pontuacao)
                VALUES (%s, %s)
            """, (jogador['nome'], jogador['pontuacao']))
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print("Erro ao salvar no banco:", e)
        return False

@app.route('/salvar_ranking', methods=['POST'])
def salvar_ranking():
    ranking = request.json
    sucesso = salvar_ranking_no_banco(ranking)
    return jsonify({"sucesso": sucesso})

if __name__ == '__main__':
    app.run(debug=True)
