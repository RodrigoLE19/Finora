import { 
  Component, 
  computed, 
  inject, 
  OnInit,
  signal 
} from '@angular/core';
import { BudgetService } from '../../core/services/budget.service';
import { ActualizarPresupuestoRequest, CrearPresupuestoRequest, Presupuesto } from '../../models/budget.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Categoria } from '../../models/category.models';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-budgets',
  imports: [ReactiveFormsModule],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css',
})
export class Budgets {

  private budgetService = inject(BudgetService);

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  catalogoCategorias = signal<Categoria[]>([]);

  presupuestoForm = this.fb.group({

    idCategoria: [
      null as number | null,
      Validators.required
    ],

    montoLimite: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ]
  });
  presupuestos = signal<Presupuesto[]>([]);
  menuPresupuestoAbierto = signal<number | null>(null);

  formularioAbierto = signal(false);
  modoEdicion = signal(false);
  presupuestoEditandoId = signal<number | null>(null);

  totalPresupuestado = computed(() => {

    return this.presupuestos().reduce(
      (total, presupuesto) =>
        total + Number(presupuesto.monto_limite),
      0
    );
  });

  totalGastado = computed(() => {

    return this.presupuestos().reduce(
      (total, presupuesto) => 
        total + Number(presupuesto.gastado),
      0
    );
  });

  totalDisponible = computed(() => {

    return this.presupuestos().reduce(
      (total, presupuesto) => 
        total + Number(presupuesto.disponible),
      0
    );
  });

  porcentajeGlobal = computed(() => {

    const limite = this.totalPresupuestado();

    if (limite === 0) {
      return 0;
    }

    return (
      this.totalGastado() / limite
    ) * 100;
  });

  totalCategorias = computed(() =>
    this.presupuestos().length
  );

  categoriasGasto = computed(() =>
    this.catalogoCategorias().filter(
      categoria => categoria.tipo === 'GASTO'
    )
  );


  isLoading = signal(true);
  errorMessage = signal('');

  mes = signal(new Date().getMonth() + 1);
  anio = signal(new Date().getFullYear());
  selectorMesAbierto = signal(false);

  anioSelector = signal(
    new Date().getFullYear()
  );

  readonly nombreMeses = [
    'Enero',
    'Febreo',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  readonly nombreMesesCortos = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];

  get periodoTexto(): string {

    const nombreMes = this.nombreMeses[this.mes() -1];
    return `${nombreMes} ${this.anio()}`;
  }

  cargarCategorias() {

    this.categoryService
      .obtenerCategorias()
      .subscribe({

        next: (response) => {

          this.catalogoCategorias.set(
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

  alternarSelectMes() {

    if (this.selectorMesAbierto()) {
      this.cerrarSelectorMes();
      return;
    }

    this.anioSelector.set(
      this.anio()
    );

    this.selectorMesAbierto.set(true);
  }

  cerrarSelectorMes() {
    this.selectorMesAbierto.set(false);
  }

  alternarMenuPresupuesto(idPresupuesto: number) {

    if (this.menuPresupuestoAbierto() === idPresupuesto) {
      this.menuPresupuestoAbierto.set(null);
      return;
    }

    this.menuPresupuestoAbierto.set(idPresupuesto);
  }

  cerrarMenuPresupuesto() {
    this.menuPresupuestoAbierto.set(null);
  }

  cambiarAnioSelector(cambio: number) {
    this.anioSelector.update(
      anio => anio + cambio
    );
  }

  seleccionarMes(numeroMes: number) {
    this.mes.set(numeroMes);

    this.anio.set(
      this.anioSelector()
    );

    this.cerrarSelectorMes();
    this.cargarPresupuestos();
  }

  ngOnInit() {
    this.cargarPresupuestos();
    this.cargarCategorias();
  }

  cargarPresupuestos() {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.budgetService
      .obtenerPresupuestos(
        this.mes(), 
        this.anio()
      )
      .subscribe({

        next: (response) => {

          this.presupuestos.set(
            response.presupuestos
          );

          this.isLoading.set(false);
        },

        error: (error) => {

          console.error(
            'Error al cargar presupuestos:'
          );

          this.isLoading.set(false);
        }

      });

  }

  guardarPresupuesto() {

    if (this.presupuestoForm.invalid) {
      this.presupuestoForm.markAllAsTouched();
      return;
    }

    const valores = this.presupuestoForm.getRawValue();

    if (
      valores.idCategoria === null ||
      valores.montoLimite === null
    ) {
      return;
    }

    if (this.modoEdicion()) {
      
      const idPresupuesto = this.presupuestoEditandoId();

      if (idPresupuesto === null) {
        return;
      }

      const datos: ActualizarPresupuestoRequest = {
        idCategoria: Number(valores.idCategoria),
        montoLimite: Number(valores.montoLimite),
        mes: this.mes(),
        anio: this.anio()
      };

      this.budgetService
        .actualizarPresupuesto(idPresupuesto, datos)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Presupuesto actualizado',
              text: 'Los cambios se guardaron correctamente.',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cerrarFormulario();
            this.cargarPresupuestos();
          },

          error: (error) => {

            console.error('Error al actualizar presupuesto:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No se pudo actualizar el presupuesto',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });

          }

        });

        return;

    }

    const datos: CrearPresupuestoRequest = {
      idCategoria: Number(valores.idCategoria),
      montoLimite: Number(valores.montoLimite),
      mes: this.mes(),
      anio: this.anio()
    };

    this.budgetService
      .crearPresupuesto(datos)
      .subscribe({

        next: () => {

          Swal.fire({
            title: 'Presupuesto creado',
            text: 'El presupuesto se registró correctamente.',
            icon: 'success',
            confirmButtonColor: '#087c71'
          });

          this.cerrarFormulario();
          this.cargarPresupuestos();
        },

        error: (error) => {

          console.error('Error al crear presupuesto:', error);

          Swal.fire({
            title: 'Error',
            text:
              error.error?.message ||
              'No se pudo crear el presupuesto',
            icon: 'error',
            confirmButtonColor: '#087c71'
          });

        }

      });
  }

  eliminarPresupuesto(idPresupuesto: number) {

    this.cerrarMenuPresupuesto();

    Swal.fire({
      title: '¿Eliminar presupuesto?',
      text: 'Esta acción eliminará el límite configurado para esta categoría',
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

      this.budgetService
        .eliminarPresupuesto(idPresupuesto)
        .subscribe({

          next: () => {

            Swal.fire({
              title: 'Presupuesto eliminado',
              text: 'El presupuesto se eliminó correctamente',
              icon: 'success',
              confirmButtonColor: '#087c71'
            });

            this.cargarPresupuestos();
          },

          error: (error) => {

            console.error('Error al eliminar presupuesto:', error);

            Swal.fire({
              title: 'Error',
              text:
                error.error?.message ||
                'No se pudo eliminar el presupuesto.',
              icon: 'error',
              confirmButtonColor: '#087c71'
            });
          }
        });
    });
  }

  abrirEditarPresupuesto(
    presupuesto: Presupuesto
  ) {

    this.modoEdicion.set(true);

    this.presupuestoEditandoId.set(presupuesto.id_presupuesto);

    this.presupuestoForm.patchValue({
      idCategoria: presupuesto.id_categoria,
      montoLimite: Number(presupuesto.monto_limite)
    });

    this.cerrarMenuPresupuesto();

    this.formularioAbierto.set(true);
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

  obtenerEstadoPresupuesto(
    porcentaje: string | number
  ): string {

    const valor = Number(porcentaje);

    if (valor >= 100) {
      return 'Límite excedido';
    }

    if (valor >= 80) {
      return 'Cerca del límite';
    }

    return 'Dentro del límite';
  }

  obtenerIconoEstado(
    porcentaje: string | number
  ): string {

    const valor = Number(porcentaje);

    if (valor >= 100) {
      return '/assets/icons/presupuestos/warning.svg';
    }

    if (valor >= 80) {
      return '/assets/icons/presupuestos/error.svg';
    }

    return '/assets/icons/presupuestos/success.svg';
  }

  abrirNuevoPresupuesto() {

    this.modoEdicion.set(false);
    this.presupuestoEditandoId.set(null);
    this.presupuestoForm.reset({
      idCategoria: null,
      montoLimite: null
    });
    this.formularioAbierto.set(true);
  }

  cerrarFormulario() {

    this.formularioAbierto.set(false);
    this.presupuestoForm.reset();
    this.presupuestoEditandoId.set(null);
    this.modoEdicion.set(false);
  }

}
