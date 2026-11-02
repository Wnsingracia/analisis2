crea tu certificado antes de correr el backend
instala choco o scoop usando powershell en modo administrador
mkdir certs && cd certs
mkcert -install
mkcert localhost 127.0.0.1 ::1
