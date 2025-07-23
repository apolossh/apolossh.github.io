import requests
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import portrait
from reportlab.lib.utils import ImageReader
import os
import re
from PIL import Image

def baixar_manga():
    url = input("Digite o link do capítulo do MangaDex: ").strip()
    
    # Extrair ID do capítulo
    match = re.search(r'/chapter/([0-9a-f-]+)', url)
    if not match:
        print("Link inválido. Deve ser do tipo: https://mangadex.org/chapter/<id>")
        return
    chapter_id = match.group(1)
    
    # Obter detalhes do capítulo (para pegar mangaId)
    chapter_api = f"https://api.mangadex.org/chapter/{chapter_id}"
    chapter_response = requests.get(chapter_api).json()
    
    if "data" not in chapter_response:
        print("Erro ao buscar dados do capítulo:", chapter_response)
        return
    
    chapter_data = chapter_response["data"]
    relationships = chapter_data.get("relationships", [])
    
    manga_id = None
    for rel in relationships:
        if rel.get("type") == "manga":
            manga_id = rel.get("id")
            break
    
    if not manga_id:
        print("Não foi possível encontrar o ID do mangá.")
        return
    
    chapter_number = chapter_data["attributes"].get("chapter", "Desconhecido")
    
    # Obter título do mangá
    manga_api = f"https://api.mangadex.org/manga/{manga_id}"
    manga_response = requests.get(manga_api).json()
    
    if "data" not in manga_response:
        print("Erro ao buscar dados do mangá:", manga_response)
        return
    
    manga_title = manga_response["data"]["attributes"]["title"].get("en") \
                  or list(manga_response["data"]["attributes"]["title"].values())[0]
    
    # Nome do PDF
    safe_title = re.sub(r'[\\/*?:"<>|]', "", manga_title)
    pdf_path = f"{safe_title}_Cap_{chapter_number}.pdf"
    
    print(f"[*] Baixando capítulo '{chapter_number}' do mangá '{manga_title}'...")
    
    # Consultar API MangaDex para pegar as imagens
    api_url = f"https://api.mangadex.org/at-home/server/{chapter_id}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        print("Erro ao acessar API!")
        return
    
    data = response.json()
    base_url = data["baseUrl"]
    hash_chapter = data["chapter"]["hash"]
    page_list = data["chapter"]["data"]
    
    print(f"[*] Encontradas {len(page_list)} páginas. Baixando...")
    
    # Criar pasta temporária
    pasta = "manga_temp"
    if not os.path.exists(pasta):
        os.mkdir(pasta)
    
    arquivos = []
    for i, filename in enumerate(page_list, start=1):
        img_url = f"{base_url}/data/{hash_chapter}/{filename}"
        try:
            img_data = requests.get(img_url).content
            nome_arquivo = os.path.join(pasta, f"pagina_{i:03d}.jpg")
            with open(nome_arquivo, "wb") as f:
                f.write(img_data)
            arquivos.append(nome_arquivo)
            print(f"Imagem {i} baixada.")
        except:
            print(f"Erro ao baixar {img_url}")
    
    # Criar PDF com tamanho original
    print("[*] Criando PDF com qualidade original...")
    c = None
    for i, arquivo in enumerate(arquivos):
        img = Image.open(arquivo)
        largura, altura = img.size
        if i == 0:
            c = canvas.Canvas(pdf_path, pagesize=portrait((largura, altura)))
        else:
            c.setPageSize(portrait((largura, altura)))
        c.drawImage(ImageReader(img), 0, 0, width=largura, height=altura)
        c.showPage()
    if c:
        c.save()
    
    print(f"[✓] PDF criado com qualidade máxima: {pdf_path}")
    
    # Limpeza
    for arquivo in arquivos:
        os.remove(arquivo)
    os.rmdir(pasta)

if __name__ == "__main__":
    baixar_manga()
