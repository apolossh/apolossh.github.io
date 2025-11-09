import yt_dlp
import os
import sys
import http.server
import socketserver
import threading
import time

server_thread = None
httpd = None
downloaded_file_path = None
download_completed = False
port = 8008

def sanitize_filename(filename):
    import re
    filename = filename.replace(' ', '_')
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = re.sub(r'_+', '_', filename)
    return filename

def download_video(url, download_path='downloads'):
    global downloaded_file_path
    
    if not os.path.exists(download_path):
        os.makedirs(download_path)
    
    ydl_opts = {
        'outtmpl': f'{download_path}/%(title)s.%(ext)s',
        'format': 'best',
        'merge_output_format': 'mp4',
        'ignoreerrors': True,
        'no_warnings': False,
        'quiet': False,
        'extract_flat': False,
        'cookiefile': 'cookies.txt',
    }
    
    if 'instagram.com' in url:
        ydl_opts.update({
            'format': 'best',
            'extract_flat': False,
        })
    
    try:
        print("🔍 Analisando URL...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'vídeo')
            duration = info.get('duration', 'N/A')
            uploader = info.get('uploader', 'N/A')
            
            print(f"📹 Título: {title}")
            print(f"👤 Uploader: {uploader}")
            if duration != 'N/A':
                mins, secs = divmod(duration, 60)
                print(f"⏱️ Duração: {mins:.0f}:{secs:02.0f}")
            
            print("⬇️ Iniciando download...")
            
            ydl.download([url])
            
            downloaded_filename = ydl.prepare_filename(info)
            sanitized_filename = sanitize_filename(os.path.basename(downloaded_filename))
            sanitized_path = os.path.join(download_path, sanitized_filename)
            
            if os.path.exists(downloaded_filename):
                os.rename(downloaded_filename, sanitized_path)
            elif os.path.exists(downloaded_filename.replace('.webm', '.mp4')):
                original_path = downloaded_filename.replace('.webm', '.mp4')
                sanitized_path = sanitized_path.replace('.webm', '.mp4')
                os.rename(original_path, sanitized_path)
            
            downloaded_file_path = sanitized_path
            print(f"✅ Download concluído com sucesso!")
            print(f"📁 Salvo em: {sanitized_path}")
            
            return sanitized_path
        
    except yt_dlp.utils.DownloadError as e:
        print(f"❌ Erro específico do download: {e}")
        if 'instagram.com' in url:
            print("🔄 Tentando método alternativo para Instagram...")
            return try_instagram_alternative(url, download_path)
        else:
            return None
    except Exception as e:
        print(f"❌ Erro durante o download: {e}")
        return None

def try_instagram_alternative(url, download_path):
    global downloaded_file_path
    
    try:
        ydl_opts_alt = {
            'outtmpl': f'{download_path}/%(title)s.%(ext)s',
            'format': 'best',
            'merge_output_format': 'mp4',
            'ignoreerrors': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts_alt) as ydl:
            info = ydl.extract_info(url, download=False)
            ydl.download([url])
            
            downloaded_filename = ydl.prepare_filename(info)
            sanitized_filename = sanitize_filename(os.path.basename(downloaded_filename))
            sanitized_path = os.path.join(download_path, sanitized_filename)
            
            if os.path.exists(downloaded_filename):
                os.rename(downloaded_filename, sanitized_path)
            
            downloaded_file_path = sanitized_path
            print("✅ Download alternativo concluído!")
            return sanitized_path
    except Exception as e:
        print(f"❌ Método alternativo também falhou: {e}")
        return None

class VideoAPIHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        global downloaded_file_path, download_completed
        
        if self.path == '/video':
            if downloaded_file_path and os.path.exists(downloaded_file_path):
                print(f"📥 Servindo vídeo: {os.path.basename(downloaded_file_path)}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'video/mp4')
                self.send_header('Content-Disposition', f'attachment; filename="{os.path.basename(downloaded_file_path)}"')
                self.send_header('Content-Length', str(os.path.getsize(downloaded_file_path)))
                self.end_headers()
                
                with open(downloaded_file_path, 'rb') as f:
                    while True:
                        data = f.read(8192)
                        if not data:
                            break
                        self.wfile.write(data)
                
                print("✅ Download via servidor concluído!")
                download_completed = True
                
            else:
                self.send_error(404, "Vídeo não encontrado")
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            if downloaded_file_path:
                message = f"Vídeo disponível em: http://localhost:{port}/video\n"
                message += f"Arquivo: {os.path.basename(downloaded_file_path)}"
            else:
                message = "Nenhum vídeo disponível"
            self.wfile.write(message.encode('utf-8'))
    
    def log_message(self, format, *args):
        pass

def start_server():
    global httpd
    
    with socketserver.TCPServer(("", port), VideoAPIHandler) as server:
        httpd = server
        print(f"🌐 API iniciada em: http://localhost:{port}")
        print("📹 Acesse o link acima para baixar o vídeo")
        server.serve_forever()

def stop_server():
    global httpd
    if httpd:
        httpd.shutdown()
        httpd.server_close()

def cleanup_files():
    global downloaded_file_path
    if downloaded_file_path and os.path.exists(downloaded_file_path):
        try:
            os.remove(downloaded_file_path)
            print(f"🗑️ Arquivo removido: {downloaded_file_path}")
        except Exception as e:
            print(f"❌ Erro ao remover arquivo: {e}")

def main():
    global download_completed
    
    print("🎬 Downloader Universal - YouTube & Instagram")
    print("=" * 45)
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("\n📋 Cole a URL do vídeo (YouTube/Instagram): ").strip()
    
    if not url:
        print("❌ URL não fornecida.")
        return
    
    if not url.startswith(('http://', 'https://')):
        print("❌ URL inválida. Deve começar com http:// ou https://")
        return
    
    print(f"🌐 URL detectada: {url}")
    
    if 'youtube.com' in url or 'youtu.be' in url:
        print("📺 Plataforma: YouTube")
    elif 'instagram.com' in url:
        print("📸 Plataforma: Instagram")
        print("⚠️  Instagram pode ser instável. Tentando métodos alternativos...")
    else:
        print("🌐 Plataforma: Outra (tentando download)")
    
    print("\n" + "=" * 45)
    
    downloaded_file = download_video(url)
    
    if downloaded_file:
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        
        try:
            print(f"\n⏳ Servidor aguardando download...")
            print(f"💡 Acesse: http://localhost:{port}/video")
            print("⏹️  Pressione Ctrl+C para encerrar manualmente")
            
            while not download_completed:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Interrompido pelo usuário")
        finally:
            stop_server()
            cleanup_files()
            print("👋 Script finalizado")
    else:
        print("\n💡 Dicas de solução para Instagram:")
        print("• O Instagram pode estar bloqueando downloads")
        print("• Tente acessar a URL no navegador primeiro para verificar se o vídeo está disponível")
        print("• Alguns vídeos do Instagram requerem login")
        print("• Atualize o yt-dlp: pip install --upgrade yt-dlp")
        print("• Tente novamente em alguns minutos")

if __name__ == "__main__":
    main()
