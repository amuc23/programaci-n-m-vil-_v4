import { Component, OnInit } from '@angular/core';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {
  productosDisponibles: any[] = [];
  productosSinStock: any[] = [];
  mostrarSinStock: boolean = true; // Controla qué página mostrar

  constructor(private alertasService: AlertasService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    const productos = [
      { nombre: 'Hollow Knight', precio: 15000, cantidad: 1, imagen: 'assets/img/juegos/caratula-hollow.jpeg' },
      { nombre: 'Batman vs Superman', precio: 550000, cantidad: 0, imagen: 'assets/img/juguetes/Batman-juguete.jpg' },
      { nombre: 'Nintendo 2ds', precio: 159000, cantidad: 2, imagen: 'assets/img/consolas/2dsXL-consola.jpeg' },
      { nombre: 'Lies of P', precio: 59000, cantidad: 0, imagen: 'assets/img/juegos/caratula-liesofp.jpeg' },
    ];

    this.productosDisponibles = productos.filter(p => p.cantidad > 0);
    this.productosSinStock = productos.filter(p => p.cantidad === 0);

    // Mostrar sin stock solo si hay productos sin stock
    this.mostrarSinStock = this.productosSinStock.length > 0;
  }

  continuar() {
    this.mostrarSinStock = false; // Pasa a la página de productos disponibles
  }

  incrementarCantidad(producto: any) {
    producto.cantidad++;
  }

  decrementarCantidad(producto: any) {
    if (producto.cantidad > 0) {
      producto.cantidad--;
    }
  }

  calcularTotal() {
    return this.productosDisponibles.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
  }

  alertascarro() {
    this.alertasService.presentAlert('Gracias Por Su Compra', '');
  }
}
