import socket

UDP_IP = "192.168.34.156"  
UDP_PORT = 5005  

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  
sock.bind((UDP_IP, UDP_PORT))

print(f"Listening for UDP packets on {UDP_IP}:{UDP_PORT}...")

while True:
    data, addr = sock.recvfrom(1024) 
    print(f"Received message from {addr}: {data.decode()}")