import sys
import json
import requests
import time
import random

def buscar_gupy(termo):
    url = f"https://employability-portal.gupy.io/api/v1/jobs?jobName={termo}&limit=25&offset=0"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        vagas_brutas = res.json().get('data', [])
        
        vagas_limpas = []
        for v in vagas_brutas:
            vagas_limpas.append({
                "id": str(v.get("id")),
                "titulo": v.get("name"),
                "empresa": v.get("careerPageName"),
                "descricao": v.get("description"),
                "data_pub": v.get("publishedDate"),
                "hardskills": [],
                "salario": "",
                "senioridade": [],
                "modelo_de_trabalho": ""
            })
        return vagas_limpas
    except Exception as e:
        return {"erro": f"Gupy: {str(e)}"}

def buscar_solides(termo):
    url = f"https://apigw.solides.com.br/jobs/v3/portal-vacancies-new?page=1&title={termo}&take=20"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        dados = res.json()
        conteudo_data = dados.get('data', [])
        vagas_brutas = conteudo_data.get('data', []) if isinstance(conteudo_data, dict) else conteudo_data
        
        vagas_limpas = []
        for v in vagas_brutas:
            sens = [s.get('name') for s in v.get('seniority', [])]
            salario_info = v.get('salary', {})
            salario = "A combinar"
            if isinstance(salario_info, dict):
                if salario_info.get('initialRange') and salario_info.get('finalRange'):
                    salario = f"R$ {salario_info.get('initialRange')} - {salario_info.get('finalRange')}"
                elif salario_info.get('negotiable'):
                    salario = "A combinar"

            vagas_limpas.append({
                "id": str(v.get("id")),
                "titulo": v.get("title"),
                "empresa": v.get("companyName", "Confidencial"),
                "descricao": v.get("description"),
                "data_pub": v.get("createdAt", "").split("T")[0],
                "hardskills": [s.get('name') for s in v.get('hardSkills', [])],
                "salario": salario,
                "senioridade": sens,
                "modelo_de_trabalho": v.get('jobType')
            })
        return vagas_limpas
    except Exception as e:
        return {"erro": f"Solides: {str(e)}"}

if __name__ == "__main__":
    site = sys.argv[1] if len(sys.argv) > 1 else "gupy"
    termo = sys.argv[2] if len(sys.argv) > 2 else "Desenvolvedor"
    
    time.sleep(random.uniform(2, 5))

    if site == "gupy":
        resultado = buscar_gupy(termo)
    elif site == "solides":
        resultado = buscar_solides(termo)
    else:
        resultado = {"erro": "Site desconhecido"}
        
    print(json.dumps(resultado))