import { Component, OnInit } from '@angular/core';
import { AlertasService } from 'src/app/services/alertas.service';
import { ManejodbService } from 'src/app/services/manejodb.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {
  productosDisponibles: any[] = [];
  productosSinStock: any[] = [];
  mostrarSinStock: boolean = true;
  idVentaActiva: number | null = null;

  constructor(
    private alertasService: AlertasService,
    private bd: ManejodbService
  ) {}

  async ngOnInit() {
    const idUsuario = await this.bd.obtenerIdUsuarioLogueado();
    if (idUsuario) {
      await this.verificarOCrearVenta(idUsuario);
      await this.cargarCarrito();
    }
  }

  async verificarOCrearVenta(idUsuario: number) {
    try {
      this.idVentaActiva = await this.bd.verificarVentaActiva(idUsuario);

      if (!this.idVentaActiva) {
        this.idVentaActiva = await this.bd.crearVenta(idUsuario);
        console.log('Nueva venta creada con ID:', this.idVentaActiva);
      } else {
        console.log('Venta activa existente con ID:', this.idVentaActiva);
      }
    } catch (error) {
      console.error('Error al verificar o crear la venta:', error);
    }
  }

  async cargarCarrito() {
    if (!this.idVentaActiva) return;

    try {
      const productos = await this.bd.obtenerDetallesVenta(this.idVentaActiva);
      this.productosDisponibles = productos.filter(p => p.cantidad > 0);
      this.productosSinStock = productos.filter(p => p.cantidad === 0);

      this.mostrarSinStock = this.productosSinStock.length > 0;
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  }

  async eliminarProductosSinStock() {
    if (!this.idVentaActiva) return;

    try {
      await this.bd.eliminarProductosSinStock(this.idVentaActiva);
      await this.cargarCarrito();
      this.alertasService.presentAlert(
        'Productos eliminados',
        'Los productos sin stock o no disponibles fueron eliminados del carrito.'
      );
    } catch (error) {
      console.error('Error al eliminar productos sin stock o no disponibles:', error);
    }
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
    return this.productosDisponibles.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0
    );
  }

  alertascarro() {
    this.alertasService.presentAlert('Gracias Por Su Compra', '');
  }
}
