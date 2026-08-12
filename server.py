import http.server
import socketserver
import json
import csv
import os
from datetime import datetime

PORT = 8000
CSV_FILE = "emails.csv"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/subscribe':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                email = data.get('email')
                
                if email:
                    file_exists = os.path.isfile(CSV_FILE)
                    # Open in append mode
                    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        if not file_exists:
                            writer.writerow(['Timestamp', 'Email'])
                        writer.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), email])
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'success'}).encode())
                else:
                    self.send_error(400, "Bad Request")
            except Exception as e:
                print(f"Error handling POST: {e}")
                self.send_error(500, "Internal Server Error")
        else:
            self.send_error(404, "Not Found")

# We use TCPServer configured to allow address reuse to avoid 'Address already in use' if restarting
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    with ReusableTCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
