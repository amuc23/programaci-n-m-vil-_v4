import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  productos: any[] = [];
  idVentaActiva: number | null = null;
  mostrarSinStock: boolean = true;

  constructor(
    private alertasService: AlertasService,
    private bd: ManejodbService,
    private cd: ChangeDetectorRef // Detecta cambios manualmente si es necesario
  ) {}

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.cargarProductos();
  }

  async obtenerVentaActiva() {
    try {
      const idUsuario = await this.bd.obtenerIdUsuarioLogueado();
      if (!idUsuario) {
        this.alertasService.presentAlert('Error', 'Debes estar logueado.');
        return;
      }
      this.idVentaActiva = await this.bd.verificarOCrearVenta(idUsuario);
      console.log('ID de Venta Activa:', this.idVentaActiva);
    } catch (error) {
      console.error('Error al obtener la venta activa:', error);
      this.alertasService.presentAlert('Error', 'No se pudo obtener la venta activa.');
    }
  }

  async cargarProductos() {
    await this.obtenerVentaActiva();
    if (!this.idVentaActiva) return;

    try {
      this.productos = await this.bd.obtenerCarroPorUsuario(this.idVentaActiva);

      this.productosDisponibles = this.productos.filter(p => p.cantidad > 0);
      this.productosSinStock = this.productos.filter(p => p.cantidad === 0);

      this.mostrarSinStock = this.productosSinStock.length > 0;

      // Forzamos la detección de cambios en caso de que Angular no los detecte automáticamente
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error al cargar productos del carrito:', error);
      this.alertasService.presentAlert('Error', 'No se pudieron cargar los productos.');
    }
  }

  continuar() {
    this.mostrarSinStock = false;
  }

  incrementarCantidad(producto: any) {
    producto.cantidad++;
    this.bd.agregarCantidad(this.idVentaActiva!, producto.id_producto);
  }

  decrementarCantidad(producto: any) {
    if (producto.cantidad > 0) {
      producto.cantidad--;
      this.bd.restarCantidad(this.idVentaActiva!, producto.id_producto);
    }
  }

  calcularTotal() {
    return this.productosDisponibles.reduce((total, producto) => total + producto.subtotal, 0);
  }

  alertascarro() {
    this.alertasService.presentAlert('Gracias Por Su Compra', '');
  }
}
