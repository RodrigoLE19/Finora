import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActualizarMovimientoRequest, CrearMovimientoRequest, Movimiento } from '../../models/movement.model';
import { MovementService } from '../../core/services/movement.service';
import Swal from 'sweetalert2';
import { CategoryService } from '../../core/services/category.service';
import { Categoria } from '../../models/category.models';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-movements',
  imports: [ReactiveFormsModule],
  templateUrl: './movements.html',
  styleUrl: './movements.css',
})
export class Movements implements OnInit {

  private movementService = inject(MovementService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  movimientos = signal<Movimiento[]>([]);

  catalogoCategorias = signal<Categoria[]>([]);
  
  formularioAbierto = signal(false);
  modoEdicion = signal(false);
  movimientoEditadoId = signal<number | null>(null);

  isLoading = signal(true);
  errorMessage = signal('');

  busqueda = signal('');
  filtroTipo = signal<'TODOS' | 'INGRESO' | 'GASTO'>('TODOS');
  filtroCategoria = signal('TODAS');

  formatearFecha(fecha: string): string {

    return new Date(fecha).toLocaleDateString(
      'es-PE',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  categorias = computed(() => {

    const categoriasUnicas = new Set(
      this.movimientos().map(
        movimiento => movimiento.categoria
      )
    );

    return Array.from(categoriasUnicas);
  });

  movimientosFiltrados = computed(() => {

    const texto = this.busqueda()
      .trim()
      .toLowerCase();

    const tipo = this.filtroTipo();
    const categoria = this.filtroCategoria();

    return this.movimientos().filter(
      movimiento => {

        const conincideBusqueda =
          movimiento.descripcion
            .toLowerCase()
            .includes(texto) ||

          movimiento.categoria
            .toLowerCase()
            .includes(texto);

        const coincidenTipo =
          tipo === 'TODOS' ||
          movimiento.tipo === tipo;

        const coincidenCategoria =
          categoria === 'TODAS' ||
          movimiento.categoria === categoria;

        return (
          conincideBusqueda &&
          coincidenTipo &&
          coincidenCategoria
        );
      }
    );
  });

  totalMovimientos = computed(() => {
    return this.movimientos().length;
  });

  totalIngresos = computed(() => {
    return this.movimientos().filter(
      movimiento => movimiento.tipo === 'INGRESO'
    ).length;
  });

  totalGastos = computed(() => {
    return this.movimientos().filter(
      movimiento => movimiento.tipo === 'GASTO'
    ).length;
  });

  actualizarBusqueda(event: Event) {

    const input =
      event.target as HTMLInputElement;

    this.busqueda.set(
      input.value
    );
  }

  seleccionarTipo(
    tipo: 'TODOS' | 'INGRESO' | 'GASTO'
  ) {

    this.filtroTipo.set(tipo);
  }

  obtenerIconoCategoria(idCategoria: number): string {

    const iconos: Record<number, string> = {

      // GASTOS
    1: '/assets/icons/categorias/gastos/alimentacion.svg',
    2: '/assets/icons/categorias/gastos/transporte.svg',
    3: '/assets/icons/categorias/gastos/hogar.svg',
    4: '/assets/icons/categorias/gastos/entretenimiento.svg',
    5: '/assets/icons/categorias/gastos/servicios.svg',
    6: '/assets/icons/categorias/gastos/salud.svg',
    7: '/assets/icons/categorias/gastos/educacion.svg',
    8: '/assets/icons/categorias/gastos/otros-g.svg',

    // INGRESOS
    9: '/assets/icons/categorias/ingresos/sueldo.svg',
    10: '/assets/icons/categorias/ingresos/ingreso-adicional.svg',
    11: '/assets/icons/categorias/ingresos/otros-i.svg'
    };

    return iconos[idCategoria] ?? '/assets/icons/dashboard/expense.svg';
  }

  seleccionarCategoria(event: Event) {

    const select =
      event.target as HTMLSelectElement;

    this.filtroCategoria.set(
      select.value
    );
  }

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarCategorias();
  }

  movimientoForm = this.fb.group({

    tipo: [
      '',
      Validators.required
    ],

    idCategoria: [
      null as number | null,
      Validators.required
    ],

    monto: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    descripcion: [
      '',
      Validators.maxLength(60)
    ],

    fecha: [
      '',
      Validators.required
    ]

  });

  cargarMovimientos() {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.movementService.obtenerMovimientos().subscribe({

      next: (response) => {

        console.log(
          'Movimientos recibidos:', response
        );

        this.movimientos.set(
          response.movimientos
        );
        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Error al cargar movimientos:', error
        );

        this.errorMessage.set('No se puedieron cargar los movimientos');
        this.isLoading.set(false);
      }

    });
  }

  guardarMovimiento() {

    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const valores = this.movimientoForm.getRawValue();

    if (
      valores.tipo !== 'INGRESO' &&
      valores.tipo !== 'GASTO'
    ) {
      return;
    }

    if (
      valores.idCategoria === null ||
      valores.monto === null ||
      !valores.fecha
    ) {
      return;
    }

    if (this.modoEdicion()) {
      
      const idMovimiento = this.movimientoEditadoId();

      if (idMovimiento === null) {
        return;
      }

      const datos: ActualizarMovimientoRequest = {
        idCategoria: Number(valores.idCategoria),
        tipo: valores.tipo as 'INGRESO' | 'GASTO',
        monto: Number(valores.monto),
        descripcion: valores.descripcion?.trim() || null,
        fecha: valores.fecha
      };

      this.movementService
        .actualizarMovimiento(idMovimiento, datos)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Movimiento actualizado',
              text: 'Los cambios se guardaron correctamente',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cerrarFormulario();
            this.cargarMovimientos();
          },

          error: (error) => {

            console.error('Error al actualizar movimiento:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No se pudo actualizar el movimiento',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }
        });

        return;
    }

    const datos: CrearMovimientoRequest = {
        idCategoria: Number(valores.idCategoria),
        tipo: valores.tipo as 'INGRESO' | 'GASTO',
        monto: Number(valores.monto),
        descripcion: valores.descripcion?.trim() || null,
        fecha: valores.fecha!,
        idGastoRecurrente: null
      };

      this.movementService
        .crearMovimiento(datos)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Movimiento registrado',
              text: 'El movimiento se guardo correctamente',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cerrarFormulario();
            this.cargarMovimientos();
          },

          error: (error) => {

            console.error('Error al registrar movimiento:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No se pudo registrar el movimiento',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }
        });

    
  }

  cargarCategorias() {

    this.categoryService
      .obtenerCategorias()
      .subscribe({

        next: (response) => {

          this.catalogoCategorias.set(
            response.categorias
          );

          console.log(
            'Categorias recibidas:',
            response.categorias
          );
        },

        error: (error) => {

          console.error(
            'Error al cargar categorias:',
            error
          );
        }
      });
  }

  categoriasPorTipo(
    tipo: string | null | undefined
  ) {

    if (
      tipo !== 'INGRESO' &&
      tipo !== 'GASTO'
    ) {
      return [];
    }

    return this.catalogoCategorias().filter(
      categoria => categoria.tipo === tipo
    );
  }

  abrirNuevoMovimiento() {

    this.modoEdicion.set(false);
    this.movimientoEditadoId.set(null);
    this.movimientoForm.reset();
    this.formularioAbierto.set(true);

  }

  cerrarFormulario() {

    this.formularioAbierto.set(false);
    this.movimientoForm.reset();
    this.movimientoEditadoId.set(null);
    this.modoEdicion.set(false);

  }

  cambiarTipoFormulario() {
    this.movimientoForm.controls.idCategoria.setValue(null);
  }

  abrirEditarMovimiento(movimiento: Movimiento) {

    this.modoEdicion.set(true);

    this.movimientoEditadoId.set(movimiento.id_movimiento);

    this.movimientoForm.patchValue({

      tipo: movimiento.tipo,
      idCategoria: movimiento.id_categoria,
      monto: Number(movimiento.monto),
      descripcion: movimiento.descripcion ?? '',
      fecha: movimiento.fecha.substring(0, 10)
    });

    this.formularioAbierto.set(true);
  }

  eliminarMovimientos(idMovimiento: number) {

    Swal.fire({
      title: '¿Eliminar movimiento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.movementService
        .eliminarMovimientos(idMovimiento)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Movimiento eliminado',
              text: 'El movimiento se eliminó correctamente.',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cargarMovimientos();
          },

          error: (error) => {

            console.error(
              'Error al eliminar movimiento',
              error
            );

            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el movimiento.',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }

        });

    });

  }
}
