import socket
UDP_IP = "192.168.34.156"  
UDP_PORT = 5005           

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

message = "Hello, PC!".encode()
sock.sendto(message, (UDP_IP, UDP_PORT))

print("UDP packet sent!")
