import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RecurringExpenseService } from '../../core/services/recurring-expense.service';
import { CrearGastoRecurrenteRequest, ActualizarGastoRecurrenteRequest, GastoRecurrente } from '../../models/recurring-expense.model';
import Swal from 'sweetalert2';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Categoria } from '../../models/category.models';

@Component({
  selector: 'app-recurring-expenses',
  imports: [ReactiveFormsModule],
  templateUrl: './recurring-expenses.html',
  styleUrl: './recurring-expenses.css',
})
export class RecurringExpenses implements OnInit {

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  private recurringExpenseService = inject(RecurringExpenseService);

  formularioAbierto = signal(false);
  modoEdicion = signal(false);
  gastoEditandoId = signal<number | null>(null);
  gastoEditandoActivo = signal(true);
  catalogoCategorias = signal<Categoria[]>([]);

  gastosRecurrentes = signal<GastoRecurrente[]>([]);
  

  isLoading = signal(true);

  errorMessage = signal('');

  filtroEstado = signal<
    'TODOS' | 'ACTIVOS' | 'INACTIVOS'
  >('TODOS');

  gastoForm = this.fb.group({

    idCategoria: [
      null as number | null,
      Validators.required
    ],

    descripcion: [
      '',
      [
        Validators.required,
        Validators.maxLength(60)
      ]
    ],

    monto: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    frecuencia: [
      'MENSUAL',
      Validators.required
    ],

    diaPago: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(31)
      ]
    ]
  });

  categoriasGasto = computed(() =>
    this.catalogoCategorias()
    .filter(
      categoria => categoria.tipo === 'GASTO'
    )
  );

  totalActivos = computed(() =>
    this.gastosRecurrentes()
    .filter(gasto => gasto.activo)
    .length
  );

  totalInactivos = computed(() => 
    this.gastosRecurrentes()
      .filter(gasto => !gasto.activo)
      .length
  );


  totalComprometido = computed(() => {

    return this.gastosRecurrentes()
      .filter(gasto => gasto.activo  && !gasto.pagado_mes)
      .reduce(
        (total, gasto) =>
          total + Number(gasto.monto),
        0
      );
  });

  gastosFiltrados = computed(() => {

    const filtro = this.filtroEstado();

    if (filtro === 'ACTIVOS') {
      
      return this.gastosRecurrentes()
        .filter(gastos => gastos.activo);
    }

    if (filtro === 'INACTIVOS') {
      return this.gastosRecurrentes()
        .filter(gastos => !gastos.activo);
    }

    return this.gastosRecurrentes();
  });

  seleccionarFiltro(
    filtro: 'TODOS' | 'ACTIVOS' | 'INACTIVOS'
  ) {

    this.filtroEstado.set(filtro);
  }

  cargarCategorias() {

    this.categoryService
      .obtenerCategorias()
      .subscribe({

        next: (response) => {

          this.catalogoCategorias.set(response.categorias);
        },

        error: (error) => {

          console.error('Error al cargar categorias:', error);
        }
      });
  }

  ngOnInit() {
    this.cargarGastosRecurrentes();
    this.cargarCategorias();

  }

  abrirNuevoGasto() {

    this.modoEdicion.set(false);

    this.gastoEditandoId.set(null);

    this.gastoForm.reset({
      idCategoria: null,
      descripcion: '',
      monto: null,
      frecuencia: 'MENSUAL',
      diaPago: null
    });

    this.formularioAbierto.set(true);
  }

  abrirEditarGasto(
    gasto: GastoRecurrente
  ) {

    this.modoEdicion.set(true);

    this.gastoEditandoId.set(gasto.id_gasto_recurrente);

    this.gastoEditandoActivo.set(gasto.activo);

    this.gastoForm.reset({
      idCategoria: gasto.id_categoria,
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto),
      frecuencia: gasto.frecuencia,
      diaPago: gasto.dia_pago
    });

    this.formularioAbierto.set(true);
  }

  cerrarFormulario() {

    this.formularioAbierto.set(false);

    this.gastoForm.reset();

    this.gastoEditandoId.set(null);

    this.modoEdicion.set(false);

    this.gastoEditandoActivo.set(true);
  }

  cargarGastosRecurrentes() {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.recurringExpenseService
      .obtenerGastosRecurrentes()
      .subscribe({

        next: (response) => {

          this.gastosRecurrentes.set(response.gastosRecurrentes);
          this.isLoading.set(false);
        },

        error: (error) => {

          console.error('Error al cargar gastos recurrentes:', error);

          this.errorMessage.set('No se pudieron cargar los gastos recurrentes.');

          this.isLoading.set(false);
        }

      });

  }

  obtenerIconoCategoria(idCategoria: number): string {

    const iconos: Record<number, string> = {
      1: '/assets/icons/categorias/gastos/alimentacion.svg',
      2: '/assets/icons/categorias/gastos/transporte.svg',
      3: '/assets/icons/categorias/gastos/hogar.svg',
      4: '/assets/icons/categorias/gastos/entretenimiento.svg',
      5: '/assets/icons/categorias/gastos/servicios.svg',
      6: '/assets/icons/categorias/gastos/salud.svg',
      7: '/assets/icons/categorias/gastos/educacion.svg',
      8: '/assets/icons/categorias/gastos/otros-g.svg'
    };

    return iconos[idCategoria]
      ?? '/assets/icons/dashboard/expense.svg';
  }


  formatearFrecuencia(frecuencia: string): string {

    if (!frecuencia) {
      return '';
    }

    return frecuencia.charAt(0).toUpperCase()
      + frecuencia.slice(1).toLowerCase();
  }

  cambiarEstadoGasto(
    gasto: GastoRecurrente
  ) {

    const nuevoEstado = !gasto.activo;

    const datos: ActualizarGastoRecurrenteRequest = {
      idCategoria: gasto.id_categoria,
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto),
      frecuencia: gasto.frecuencia,
      diaPago: gasto.dia_pago,
      activo: nuevoEstado
    };

    this.recurringExpenseService
      .actualizarGastoRecurrente(
        gasto.id_gasto_recurrente,
        datos
      )
      .subscribe({

        next: () => {

          Swal.fire({
            title: nuevoEstado
              ? 'Gasto activado'
              : 'Gasto desactivado',
            text: nuevoEstado
              ? 'El gasto recurrente vuelve a considerarse dentro de tus compromisos.'
              : 'El gasto recurrente ya no se considerará dentro de tus compromisos.',
            icon: 'success',
            confirmButtonColor: '#087c71'
          });

          this.cargarGastosRecurrentes();
        },

        error: (error) => {

          console.error('Error al cambiar estado:', error);

          Swal.fire({
            title: 'Error',
            text:
              error.error?.message ||
              'No se pudo cambiar el estado del gasto recurrente.',
            icon: 'error',
            confirmButtonColor: '#087c71'
          });
        }
      });
  }

  registrarPago(gasto: GastoRecurrente) {

    if (!gasto.activo) {
        Swal.fire({
            title: 'Gasto inactivo',
            text: 'Primero debes activar este gasto recurrente.',
            icon: 'warning',
            confirmButtonColor: '#087c71'
        });

        return;
    }

    if (gasto.pagado_mes) {
        Swal.fire({
            title: 'Pago ya registrado',
            text: 'Este gasto recurrente ya fue pagado este mes.',
            icon: 'info',
            confirmButtonColor: '#087c71'
        });

        return;
    }

    Swal.fire({
        title: '¿Registrar pago?',
        text: `Se registrará S/ ${Number(gasto.monto).toFixed(2)} como gasto de ${gasto.descripcion}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#087c71',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, registrar pago',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {

        if (!resultado.isConfirmed) {
            return;
        }

        const hoy = new Date();

        const fecha = [
            hoy.getFullYear(),
            String(hoy.getMonth() + 1).padStart(2, '0'),
            String(hoy.getDate()).padStart(2, '0')
        ].join('-');

        this.recurringExpenseService
            .registrarPago(
                gasto.id_gasto_recurrente,
                { fecha }
            )
            .subscribe({

                next: () => {

                    Swal.fire({
                        title: 'Pago registrado',
                        text: 'El gasto se agregó correctamente a tus movimientos.',
                        icon: 'success',
                        confirmButtonColor: '#087c71'
                    });

                    this.cargarGastosRecurrentes();
                },

                error: (error) => {

                    console.error(
                        'Error al registrar pago recurrente:',
                        error
                    );

                    Swal.fire({
                        title: 'Error',
                        text:
                            error.error?.message ||
                            'No se pudo registrar el pago.',
                        icon: 'error',
                        confirmButtonColor: '#087c71'
                    });
                }

            });

    });
  }

  guardarGastoRecurrente() {

    if (this.gastoForm.invalid) {
      this.gastoForm.markAllAsTouched();
      return;
    }

    const valores = this.gastoForm.getRawValue();

    if (
      valores.idCategoria === null ||
      valores.monto === null ||
      valores.diaPago === null ||
      !valores.descripcion ||
      !valores.frecuencia
    ) {
      return;
    }

    if (this.modoEdicion()) {
      
      const idGasto = this.gastoEditandoId();

      if (idGasto === null) {
        return;
      }

      const datos: ActualizarGastoRecurrenteRequest = {
        idCategoria: Number(valores.idCategoria),
        descripcion: valores.descripcion.trim(),
        monto: Number(valores.monto),
        frecuencia: valores.frecuencia,
        diaPago: Number(valores.diaPago),
        activo: this.gastoEditandoActivo()
      };

      this.recurringExpenseService
        .actualizarGastoRecurrente(idGasto, datos)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Gasto actualizado',
              text: 'Los cambios se guardaron correctamente.',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cerrarFormulario();

            this.cargarGastosRecurrentes();
          },

          error: (error) => {

            console.error('Error al actualizar gasto recurrente:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No ae pudo actualizar el gasto recurrente.',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }
        });

        return;
    }

    const datos: CrearGastoRecurrenteRequest = {
      idCategoria: Number(valores.idCategoria),
      descripcion: valores.descripcion.trim(),
      monto: Number(valores.monto),
      frecuencia: valores.frecuencia,
      diaPago: Number(valores.diaPago)
    };

    this.recurringExpenseService
      .crearGastoRecurrente(datos)
      .subscribe({

        next: () => {

          Swal.fire({
            title: 'Gasto recurrente creado',
            text: 'El gasto recurrente se registró correctamente.',
            icon: 'success',
            confirmButtonColor: '#087c71'
          });

          this.cerrarFormulario();

          this.cargarGastosRecurrentes();
        },

        error: (error) => {

          console.error('Error al crear gasto recurrente:', error);

          Swal.fire({
            title: 'Error',
            text:
              error.error?.message ||
              'No ae pudo crear el gasto recurrente.',
            icon: 'error',
            confirmButtonColor: '#087c71'
          });
        }
      });
  }

  eliminarGastoRecurrente(idGastoRecurrente: number) {

    Swal.fire({
      title: '¿Eliminar gasto recurrente?',
      text: 'Esta acción eliminará el gasto recurrente de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.recurringExpenseService
        .eliminarGastoRecurrente(idGastoRecurrente)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Gasto eliminado',
              text: 'El gasto recurrente se eliminó correctamente.',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cargarGastosRecurrentes();
          },

          error: (error) => {

            console.error('Error al eliminar gasto recurrente:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No se pudo eliminar el gasto recurrente.',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }
        });
    });
  }

}
