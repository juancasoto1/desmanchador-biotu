(function(){
  'use strict';

  const WA_NUMBER   = '573166152899';
  const TIENDA_BASE = 'https://tienda.equoradistribuciones.com';
  // Local/file:// → apuntar a localhost:3000
  // Producción    → rutas relativas (mismo servidor Railway)
  const _h = window.location.hostname;
  const API_BASE = (_h===''||_h==='localhost'||_h==='127.0.0.1')
    ? 'http://localhost:3000'
    : '';

  // ── Maps ──────────────────────────────────────────────────────────────────
  const SLUG_MAP = {
    'lavaloza':                 'lavaloza-antibacterial',
    'lavaloza-pro':             'lavaloza-liquido-antibacterial-pro-max',
    'ambientador':              'ambientador-y-limpia-pisos-biotu',
    'desengrasante-cocina':     'desengrasante_de_cocina_biotu',
    'desengrasante-motores':    'desengrasante_de_motores_biotu',
    'desengrasante-pro':        'desengrasante_profesional_biotu',
    'desmanchador':             'desmanchador-de-juntas-y-banos',
    'det-blanca':               'detergente_liquido_ropa_blanca_biotu',
    'det-color':                'detergente_liquido_ropa_color_biotu',
    'det-delicada':             'detergente_liquido_ropa_delicada_biotu',
    'det-multiusos':            'detergente-liquido-multiusos-biotu',
    'eliminador-olores':        'eliminador_de_olores_biotu',
    'jabon-manos':              'jabon_liquido_manos_y_cuerpo_biotu',
    'limpiador-desinfectante':  'limpiador_desinfectante_de_superficies_biotu',
    'limpiavidrios':            'limpiavidrios_biotu',
    'shampoo':                  'shampoo_para_vehiculos_biotu',
    'suavizante':               'suavizante_ropa_liquido_biotu',
  };

  const IMAGE_MAP = {
    'lavaloza-antibacterial':                      'Lavaloza Liq Antibacterial Atom 500ml.png',
    'lavaloza-liquido-antibacterial-pro-max':       'Lavaloza Liq Antibacterial PRO Atom 500ml.png',
    'detergente_liquido_ropa_blanca_biotu':         'Detergente Liq RB DP 500ml-1L.png',
    'detergente_liquido_ropa_color_biotu':          'Detergente Liq RC DP 500ml-1L.png',
    'detergente_liquido_ropa_delicada_biotu':       'Detergente Ropa Delicada DP 500ml-1L.png',
    'detergente-liquido-multiusos-biotu':           'Detergente Multiusos DP 500ml-1L.png',
    'suavizante_ropa_liquido_biotu':                'Suavizante de Ropa Bolsa DP 500ml-1L.png',
    'ambientador-y-limpia-pisos-biotu':             'Ambientador y Limpiapisos DP 500ml-1L.png',
    'limpiavidrios_biotu':                          'Limpiavidrios Atom 500ml.png',
    'desengrasante_de_cocina_biotu':                'Desengrasante Atom 500ml.png',
    'desmanchador-de-juntas-y-banos':               'Desmanchador de Juntas y Baños Atom 500ml.png',
    'eliminador_de_olores_biotu':                   'Eliminador de Olores Atom 500ml.png',
    'limpiador_desinfectante_de_superficies_biotu': 'Limpiador Desinfectante Superfices Atom 500ml.png',
    'desengrasante_profesional_biotu':              'Desengrasante Profesional Tarro 500ml.png',
    'desengrasante_de_motores_biotu':               'Desengrasante de Motores DP 500ml-1L.png',
    'shampoo_para_vehiculos_biotu':                 'Shampoo para vehiculos DP 500ml-1L.png',
    'jabon_liquido_manos_y_cuerpo_biotu':           'Jabón Manos y Cuerpo Aconcagua Dispensador 500ml.png',
  };

  const LANDING_MAP = {
    'lavaloza-antibacterial':                      'landing-lavaloza.html',
    'lavaloza-liquido-antibacterial-pro-max':       'landing-lavaloza-pro.html',
    'detergente_liquido_ropa_blanca_biotu':         'landing-det-blanca.html',
    'detergente_liquido_ropa_color_biotu':          'landing-det-color.html',
    'detergente_liquido_ropa_delicada_biotu':       'landing-det-delicada.html',
    'detergente-liquido-multiusos-biotu':           'landing-det-multiusos.html',
    'suavizante_ropa_liquido_biotu':                'landing-suavizante.html',
    'ambientador-y-limpia-pisos-biotu':             'landing-ambientador.html',
    'limpiavidrios_biotu':                          'landing-limpiavidrios.html',
    'desengrasante_de_cocina_biotu':                'landing-desengrasante-cocina.html',
    'desmanchador-de-juntas-y-banos':               'landing-desmanchador.html',
    'eliminador_de_olores_biotu':                   'landing-eliminador-olores.html',
    'limpiador_desinfectante_de_superficies_biotu': 'landing-limpiador-desinfectante.html',
    'desengrasante_profesional_biotu':              'landing-desengrasante-pro.html',
    'desengrasante_de_motores_biotu':               'landing-desengrasante-motores.html',
    'shampoo_para_vehiculos_biotu':                 'landing-shampoo-vehiculos.html',
    'jabon_liquido_manos_y_cuerpo_biotu':           'landing-jabon-manos.html',
  };

  // ── Contenido estático por producto ──────────────────────────────────────
  // name / description: fallbacks si la API no responde
  // benefits, features, step2, faqDilution, reviews: siempre desde aquí (sin API)
  const PRODUCT_CONTENT = {
    'lavaloza-antibacterial':{
      name:'Lavaloza Líquido Antibacterial Biotú',
      description:'Lavaloza de alta eficiencia con fórmula antibacterial que elimina el 99.9% de gérmenes. Espuma abundante y acción desengrasante para vajillas, ollas y utensilios de cocina. Suave con las manos gracias a su pH balanceado.',
      category:'Línea Cocina · Biotú',
      benefits:[
        {icon:'drop',title:'Fórmula antibacterial',desc:'Elimina el 99.9% de gérmenes y bacterias en vajillas y utensilios.'},
        {icon:'leaf',title:'Biodegradable',desc:'Composición ecológica que cuida el medio ambiente sin sacrificar eficacia.'},
        {icon:'sparkle',title:'Alta espuma',desc:'Espuma abundante y duradera que facilita el lavado con menos producto.'},
        {icon:'shield',title:'Suave con las manos',desc:'pH balanceado que protege la piel durante el lavado diario.'},
      ],
      features:[
        {icon:'drop',title:'Antibacterial certificado',desc:'Elimina 99.9% de bacterias'},
        {icon:'leaf',title:'Fórmula ecológica',desc:'Sin fosfatos ni parabenos'},
        {icon:'sparkle',title:'Alta concentración',desc:'Rinde hasta 3 veces más'},
      ],
      step2:'Aplica unas gotas directamente sobre la esponja o el utensilio a lavar.',
      faqDilution:{show:true,text:'Puede diluirse en proporción 1:5 con agua para uso regular. Para grasa intensa úsalo puro.'},
      reviews:[
        {text:'Quita la grasa de las sartenes de una sola pasada. Nunca había encontrado algo tan efectivo.',name:'Ana R.',city:'Bogotá',init:'A'},
        {text:'La espuma dura muchísimo y el olor a limpio es increíble. Lo uso en el restaurante.',name:'Pedro V.',city:'Medellín',init:'P'},
        {text:'Mi vajilla quedó como nueva. Lo recomiendo a todas mis amigas.',name:'Sandra L.',city:'Cali',init:'S'},
      ],
    },
    'lavaloza-liquido-antibacterial-pro-max':{
      name:'Lavaloza Líquido Antibacterial Pro Max Biotú',
      description:'Fórmula profesional de máxima concentración para restaurantes, hoteles y cocinas de alta demanda. Doble acción antibacterial que actúa contra bacterias Gram+ y Gram−. Mayor rendimiento por litro, menor costo por lavado.',
      category:'Línea Profesional · Biotú',
      benefits:[
        {icon:'shield',title:'Pro Max',desc:'Fórmula potenciada para uso profesional en restaurantes y cocinas industriales.'},
        {icon:'drop',title:'Ultra concentrado',desc:'Máxima eficiencia con menor consumo de producto por lavado.'},
        {icon:'leaf',title:'Biodegradable',desc:'Respetuoso con el medio ambiente sin perder potencia de limpieza.'},
        {icon:'sparkle',title:'Doble acción antibacterial',desc:'Actúa contra bacterias Gram+ y Gram− de forma simultánea.'},
      ],
      features:[
        {icon:'shield',title:'Uso profesional',desc:'Ideal para restaurantes y hoteles'},
        {icon:'drop',title:'Ultra concentrado',desc:'Mayor rendimiento por litro'},
        {icon:'sparkle',title:'Doble acción',desc:'Limpia y desinfecta'},
      ],
      step2:'Aplica directamente sobre utensilios o dilúye 1:10 para limpieza general.',
      faqDilution:{show:true,text:'Dilución recomendada 1:10 para uso general. Sin diluir para desengrase intensivo.'},
      reviews:[
        {text:'En mi restaurante es indispensable. Limpia y desinfecta en un solo paso.',name:'Chef Mario C.',city:'Bogotá',init:'M'},
        {text:'Probé muchas marcas y este es el que mejor funciona con el mínimo de producto.',name:'Adriana F.',city:'Barranquilla',init:'A'},
        {text:'El olor persiste por horas y los platos quedan perfectos.',name:'Javier T.',city:'Cali',init:'J'},
      ],
    },
    'detergente_liquido_ropa_blanca_biotu':{
      name:'Detergente Líquido Ropa Blanca Biotú',
      description:'Detergente líquido con blanqueador óptico y enzimas activas diseñado para mantener la ropa blanca impecable. Elimina manchas orgánicas difíciles como sangre, sudor y café sin dañar las fibras.',
      category:'Línea Lavandería · Biotú',
      benefits:[
        {icon:'sparkle',title:'Blanqueador óptico',desc:'Mantiene los blancos impecables y sin amarillamiento con cada lavada.'},
        {icon:'drop',title:'Acción enzimática',desc:'Enzimas que descomponen manchas orgánicas difíciles como sangre y sudor.'},
        {icon:'leaf',title:'Sin fosfatos',desc:'Fórmula ecológica que no daña las tuberías ni el medio ambiente.'},
        {icon:'shield',title:'Compatible con todas las lavadoras',desc:'Funciona en carga frontal y carga superior.'},
      ],
      features:[
        {icon:'sparkle',title:'Blanqueador óptico',desc:'Blancos perfectos sin daño'},
        {icon:'drop',title:'Fórmula enzimática',desc:'Elimina manchas difíciles'},
        {icon:'leaf',title:'Sin fosfatos',desc:'Eco-friendly certificado'},
      ],
      step2:'Agrega 50ml por carga en el compartimento de detergente de tu lavadora.',
      faqDilution:{show:false},
      reviews:[
        {text:'Mis camisas blancas quedaron como recién compradas. Increíble el resultado.',name:'Roberto A.',city:'Bogotá',init:'R'},
        {text:'Uso la mitad de la cantidad y la ropa queda igual de limpia.',name:'Patricia G.',city:'Bucaramanga',init:'P'},
        {text:'El olor es fresco y duradero. No vuelvo a comprar otra marca.',name:'Catalina M.',city:'Pereira',init:'C'},
      ],
    },
    'detergente_liquido_ropa_color_biotu':{
      name:'Detergente Líquido Ropa Color Biotú',
      description:'Detergente especial para ropa de colores con tecnología fijadora que evita el desteñido. Suavizante incorporado para tejidos suaves desde el primer lavado. pH neutro ideal para telas delicadas.',
      category:'Línea Lavandería · Biotú',
      benefits:[
        {icon:'sparkle',title:'Protector de color',desc:'Fijadores de color que evitan el desteñido y mantienen los colores vibrantes.'},
        {icon:'drop',title:'Suavizante incorporado',desc:'Tejidos suaves y con buen olor desde el primer lavado.'},
        {icon:'leaf',title:'pH neutro',desc:'Ideal para telas delicadas y colores intensos sin riesgo de daño.'},
        {icon:'shield',title:'Anti-pelusa',desc:'Reduce la acumulación de pelusas y bolitas en la tela.'},
      ],
      features:[
        {icon:'sparkle',title:'Fija colores',desc:'Colores vibrantes por más tiempo'},
        {icon:'drop',title:'Suavizante incluido',desc:'Doble función en un solo producto'},
        {icon:'leaf',title:'pH neutro',desc:'Seguro para telas delicadas'},
      ],
      step2:'Añade 50ml por carga en el dispensador de detergente de tu lavadora.',
      faqDilution:{show:false},
      reviews:[
        {text:'Mi ropa de colores no se ha desteñido para nada. Llevo 6 meses usándolo.',name:'Valeria C.',city:'Bogotá',init:'V'},
        {text:'La ropa queda muy suave y el olor dura varios días.',name:'Diego H.',city:'Medellín',init:'D'},
        {text:'Perfecto para mis uniformes de trabajo. Los colores siguen igual.',name:'Mónica P.',city:'Cali',init:'M'},
      ],
    },
    'detergente_liquido_ropa_delicada_biotu':{
      name:'Detergente Líquido Ropa Delicada Biotú',
      description:'Detergente ultramild formulado para lana, seda, encajes y tejidos delicados. Sin enzimas agresivas que dañen las fibras naturales. Aroma floral suave que permanece en las prendas.',
      category:'Línea Lavandería · Biotú',
      benefits:[
        {icon:'leaf',title:'Ultramild',desc:'Fórmula suave ideal para lana, seda, encajes y tejidos delicados.'},
        {icon:'drop',title:'Sin enzimas agresivas',desc:'Cuida las fibras naturales sin degradar el tejido.'},
        {icon:'sparkle',title:'Aroma floral',desc:'Fragancia suave y fresca que permanece en las prendas.'},
        {icon:'shield',title:'Lavado a mano y máquina',desc:'Eficaz en lavado manual o ciclo delicados.'},
      ],
      features:[
        {icon:'leaf',title:'Ultra suave',desc:'Para lana, seda y encajes'},
        {icon:'drop',title:'Sin enzimas',desc:'No daña fibras naturales'},
        {icon:'sparkle',title:'Aroma floral',desc:'Fragancia duradera'},
      ],
      step2:'Disuelve 30ml en agua fría antes de sumergir las prendas. Para lavadora usa ciclo delicados.',
      faqDilution:{show:true,text:'Dilúye 30ml en 5 litros de agua fría para lavado a mano de ropa delicada.'},
      reviews:[
        {text:'Mis suéteres de lana quedaron perfectos. No se encogieron ni perdieron forma.',name:'Isabella R.',city:'Bogotá',init:'I'},
        {text:'Lo uso para lavar mis blusas de seda. Es el único que no las daña.',name:'Marcela F.',city:'Medellín',init:'M'},
        {text:'El aroma es muy elegante y suave. La ropa queda impecable.',name:'Sofia G.',city:'Cali',init:'S'},
      ],
    },
    'detergente-liquido-multiusos-biotu':{
      name:'Detergente Líquido Multiusos Biotú',
      description:'Detergente líquido concentrado con múltiples aplicaciones: ropa, superficies, pisos y tapetes. Fórmula desengrasante de alto rendimiento que simplifica las compras del hogar o empresa.',
      category:'Línea Hogar · Biotú',
      benefits:[
        {icon:'sparkle',title:'Multiusos versátil',desc:'Limpia ropa, superficies, tapetes y más con una sola fórmula.'},
        {icon:'drop',title:'Desengrasante',desc:'Elimina grasa y aceite tanto de telas como de superficies duras.'},
        {icon:'leaf',title:'Concentrado',desc:'Alta dilución que reduce el costo por uso considerablemente.'},
        {icon:'shield',title:'Sin enjuague en superficies',desc:'Para limpieza de pisos y mesones no requiere enjuague.'},
      ],
      features:[
        {icon:'sparkle',title:'Multi-aplicación',desc:'Ropa, pisos y superficies'},
        {icon:'drop',title:'Desengrasante',desc:'Elimina grasa eficazmente'},
        {icon:'leaf',title:'Muy concentrado',desc:'Mayor ahorro por uso'},
      ],
      step2:'Para ropa: 50ml por carga. Para superficies: dilúye 20ml en 1 litro de agua.',
      faqDilution:{show:true,text:'Para ropa usa 50ml por carga. Para pisos dilúye 20ml en 1L de agua. Para desengrase puro.'},
      reviews:[
        {text:'Lo uso para todo en casa y funciona de maravilla. Un solo producto para mil usos.',name:'Hernando V.',city:'Bogotá',init:'H'},
        {text:'Con poco producto limpia mucho. Es lo más económico que he encontrado.',name:'Gloria M.',city:'Barranquilla',init:'G'},
        {text:'Perfecto para la empresa. Simplifiqué mis compras de limpieza.',name:'Andrés P.',city:'Cali',init:'A'},
      ],
    },
    'suavizante_ropa_liquido_biotu':{
      name:'Suavizante de Ropa Líquido Biotú',
      description:'Suavizante con tecnología de microencapsulación que libera fragancia hasta 7 días. Reduce la electricidad estática y facilita el planchado. Fórmula antiestática que mantiene las prendas suaves al tacto.',
      category:'Línea Lavandería · Biotú',
      benefits:[
        {icon:'leaf',title:'Suavidad máxima',desc:'Fibras suaves al tacto desde el primer lavado con microencapsulación.'},
        {icon:'sparkle',title:'Aroma duradero',desc:'Fragancia que permanece en las prendas hasta 7 días.'},
        {icon:'drop',title:'Anti-estático',desc:'Elimina la electricidad estática para mayor comodidad al vestir.'},
        {icon:'shield',title:'Fácil planchado',desc:'Reduce las arrugas facilitando el planchado.'},
      ],
      features:[
        {icon:'leaf',title:'Microencapsulación',desc:'Aroma hasta 7 días'},
        {icon:'drop',title:'Anti-estático',desc:'Elimina electricidad estática'},
        {icon:'sparkle',title:'Suavidad',desc:'Fibras suaves desde el primer uso'},
      ],
      step2:'Agrega en el compartimento de suavizante de tu lavadora (aprox. 40ml por carga).',
      faqDilution:{show:false},
      reviews:[
        {text:'La ropa queda suavísima y el olor dura varios días. Increíble.',name:'Camila H.',city:'Bogotá',init:'C'},
        {text:'Mi ropa de cama huele maravilloso. Toda la familia lo nota.',name:'Bernardo A.',city:'Medellín',init:'B'},
        {text:'Reduce mucho las arrugas. Casi no necesito planchar.',name:'Natalia T.',city:'Cali',init:'N'},
      ],
    },
    'ambientador-y-limpia-pisos-biotu':{
      name:'Ambientador y Limpiapisos Biotú',
      description:'Producto 2 en 1 que limpia y ambientica al mismo tiempo. Acción antibacterial sobre el piso con fragancia fresca que permanece por horas. Compatible con todo tipo de superficies: porcelanato, baldosa, madera y vinilo.',
      category:'Línea Hogar · Biotú',
      benefits:[
        {icon:'sparkle',title:'Doble acción',desc:'Limpia y ambientica al mismo tiempo, dejando superficies brillantes.'},
        {icon:'drop',title:'Antibacterial',desc:'Elimina gérmenes del piso mientras limpia y perfuma el ambiente.'},
        {icon:'leaf',title:'Aroma duradero',desc:'Fragancia fresca que permanece por horas en el ambiente.'},
        {icon:'shield',title:'Para todo tipo de pisos',desc:'Porcelanato, baldosa, madera y vinilo.'},
      ],
      features:[
        {icon:'sparkle',title:'2 en 1',desc:'Limpia y ambientica'},
        {icon:'drop',title:'Antibacterial',desc:'Elimina gérmenes del piso'},
        {icon:'leaf',title:'Aroma duradero',desc:'Fragancia por horas'},
      ],
      step2:'Dilúye 30-50ml en 5 litros de agua y trapea normalmente.',
      faqDilution:{show:true,text:'Dilúye 30-50ml en 5 litros de agua. Para mayor fragancia usa la dosis más alta.'},
      reviews:[
        {text:'El piso queda brillante y la casa huele a limpio por horas.',name:'Rosa M.',city:'Bogotá',init:'R'},
        {text:'Este es el que más rinde y deja mejor olor de todos los que probé.',name:'Carlos R.',city:'Medellín',init:'C'},
        {text:'Mis clientes siempre preguntan qué uso para limpiar. Les recomiendo este.',name:'Jenny P.',city:'Barranquilla',init:'J'},
      ],
    },
    'limpiavidrios_biotu':{
      name:'Limpiavidrios Biotú',
      description:'Fórmula especial que elimina manchas de grasa, huellas y polvo de vidrios y espejos sin dejar rayas. Efecto antiestático que repele el polvo por más tiempo. Ideal para vidrios, espejos, cromados y acero inoxidable.',
      category:'Línea Hogar · Biotú',
      benefits:[
        {icon:'sparkle',title:'Sin rayas',desc:'Fórmula especial que deja vidrios y espejos perfectamente transparentes.'},
        {icon:'drop',title:'Acción rápida',desc:'Actúa en segundos disolviendo manchas de grasa, huellas y polvo.'},
        {icon:'leaf',title:'Antiestático',desc:'Repele el polvo por más tiempo para mantener vidrios limpios.'},
        {icon:'shield',title:'Multi-superficie',desc:'Vidrios, espejos, cromados, acero inoxidable y plásticos transparentes.'},
      ],
      features:[
        {icon:'sparkle',title:'Sin rayas',desc:'Acabado perfecto sin marcas'},
        {icon:'drop',title:'Rápido',desc:'Actúa en segundos'},
        {icon:'leaf',title:'Antiestático',desc:'Repele el polvo más tiempo'},
      ],
      step2:'Pulveriza directamente sobre el vidrio y limpia con paño de microfibra seco.',
      faqDilution:{show:true,text:'Se usa puro para mejor resultado. Puede diluirse 1:3 para limpieza de mantenimiento.'},
      reviews:[
        {text:'Los vidrios de mi oficina quedaron impecables. Sin rayas y súper brillantes.',name:'Felipe A.',city:'Bogotá',init:'F'},
        {text:'Lo uso para el carro y los espejos de casa. Funciona perfectísimo.',name:'Diana O.',city:'Medellín',init:'D'},
        {text:'Los espejos quedan tan claros que parece que no tienen vidrio.',name:'Claudia R.',city:'Cali',init:'C'},
      ],
    },
    'desengrasante_de_cocina_biotu':{
      name:'Desengrasante de Cocina y Superficies Biotú',
      description:'Desengrasante de alta potencia para grasa carbonizada, aceites y residuos de cocción en estufas, hornos y campanas. Comienza a actuar en menos de 30 segundos. Seguro para superficies en contacto con alimentos.',
      category:'Línea Cocina · Biotú',
      benefits:[
        {icon:'drop',title:'Potente desengrasante',desc:'Elimina grasa carbonizada, aceites y residuos de cocción.'},
        {icon:'sparkle',title:'Acción instantánea',desc:'Comienza a disolver la grasa en menos de 30 segundos.'},
        {icon:'leaf',title:'Sin residuos tóxicos',desc:'No deja residuos en superficies en contacto con alimentos.'},
        {icon:'shield',title:'Multi-superficie cocina',desc:'Estufas, hornos, campanas, azulejos y mesones.'},
      ],
      features:[
        {icon:'drop',title:'Potencia máxima',desc:'Grasa carbonizada en segundos'},
        {icon:'leaf',title:'Food-safe',desc:'Seguro para superficies de cocina'},
        {icon:'sparkle',title:'Sin enjuague',desc:'Para superficies no porosas'},
      ],
      step2:'Pulveriza sobre la superficie engrasada, espera 30 segundos y limpia con paño húmedo.',
      faqDilution:{show:true,text:'Úsalo puro para grasa intensa. Dilúye 1:5 para limpieza diaria de mantenimiento.'},
      reviews:[
        {text:'Limpié la campana de mi cocina que llevaba meses sin lavar. Quedó como nueva.',name:'Teresa L.',city:'Bogotá',init:'T'},
        {text:'El estufa quedó perfecta sin tener que tallar. Solo apliqué y limpié.',name:'Ricardo B.',city:'Bucaramanga',init:'R'},
        {text:'En mi restaurante es esencial. Lo uso todos los días en la cocina.',name:'Chef Alberto M.',city:'Bogotá',init:'A'},
      ],
    },
    'desmanchador-de-juntas-y-banos':{
      name:'Desmanchador de Juntas y Baños Biotú',
      description:'Fórmula específica para eliminar moho, hongos y sarro en juntas de cerámica, sanitarios y superficies de baño. Restaura el color original de las juntas oscurecidas. Bactericida y fungicida de amplio espectro.',
      category:'Línea Baños · Biotú',
      benefits:[
        {icon:'sparkle',title:'Elimina hongos',desc:'Fórmula específica contra moho y hongos en juntas y grietas.'},
        {icon:'drop',title:'Blanquea juntas',desc:'Devuelve el color original a las juntas de cerámica oscurecidas.'},
        {icon:'leaf',title:'Anti-sarro',desc:'Disuelve el sarro y los depósitos minerales en sanitarios.'},
        {icon:'shield',title:'Desinfecta',desc:'Bactericida y fungicida de amplio espectro.'},
      ],
      features:[
        {icon:'sparkle',title:'Anti-moho',desc:'Elimina hongos en juntas'},
        {icon:'drop',title:'Blanqueador',desc:'Juntas blancas de nuevo'},
        {icon:'leaf',title:'Anti-sarro',desc:'Disuelve depósitos minerales'},
      ],
      step2:'Aplica directamente en juntas o superficies afectadas, deja actuar 5 minutos y cepilla.',
      faqDilution:{show:false},
      reviews:[
        {text:'Las juntas del baño quedaron blancas otra vez. Era exactamente lo que necesitaba.',name:'Pilar R.',city:'Bogotá',init:'P'},
        {text:'Eliminó el moho que ningún otro producto había podido. Muy recomendado.',name:'Gustavo F.',city:'Medellín',init:'G'},
        {text:'El sanitario quedó sin una sola mancha de sarro. Increíble producto.',name:'Luz M.',city:'Cali',init:'L'},
      ],
    },
    'eliminador_de_olores_biotu':{
      name:'Eliminador de Olores Biotú',
      description:'Neutralizador de olores en base acuosa que actúa directamente sobre los compuestos odoríferos, no solo los enmascara. Efectivo contra olores de mascotas, humedad, cocina, baño y tabaco. Sin aerosoles ni propelentes dañinos.',
      category:'Línea Hogar · Biotú',
      benefits:[
        {icon:'leaf',title:'Neutraliza olores',desc:'No enmascara: elimina los compuestos odoríferos en la fuente.'},
        {icon:'sparkle',title:'Acción prolongada',desc:'El efecto neutralizador persiste por horas en ambientes cerrados.'},
        {icon:'drop',title:'Multi-ambiente',desc:'Mascotas, humedad, cocina, baño y tabaco.'},
        {icon:'shield',title:'Sin aerosoles dañinos',desc:'Fórmula en base acuosa, sin propelentes ni CFC.'},
      ],
      features:[
        {icon:'leaf',title:'Neutralización real',desc:'Elimina en la fuente, no enmascara'},
        {icon:'sparkle',title:'Larga duración',desc:'Efecto por horas'},
        {icon:'drop',title:'Multiusos',desc:'Todos los ambientes del hogar'},
      ],
      step2:'Pulveriza en el ambiente o sobre la superficie con olor. No requiere enjuague.',
      faqDilution:{show:true,text:'Puede diluirse 1:3 para uso en spray de ambiente. Úsalo puro para olores intensos.'},
      reviews:[
        {text:'Eliminó el olor a mascota de la sala. Ahora huele fresco todo el tiempo.',name:'Alejandra V.',city:'Bogotá',init:'A'},
        {text:'Lo uso en la cocina después de freír y el olor desaparece en minutos.',name:'Humberto C.',city:'Medellín',init:'H'},
        {text:'El mejor producto para eliminar olores que he probado en años.',name:'Paola R.',city:'Barranquilla',init:'P'},
      ],
    },
    'limpiador_desinfectante_de_superficies_biotu':{
      name:'Limpiador Desinfectante de Superficies Biotú',
      description:'Desinfectante de grado hospitalario que elimina bacterias, virus y hongos en segundos. No requiere enjuague posterior. Ideal para mesones, puertas, sanitarios y equipos de cocina o laboratorio.',
      category:'Línea Desinfección · Biotú',
      benefits:[
        {icon:'shield',title:'Grado hospitalario',desc:'Elimina bacterias, virus y hongos en segundos.'},
        {icon:'drop',title:'No requiere enjuague',desc:'Seguro para dejar actuar en superficies sin enjuagar.'},
        {icon:'sparkle',title:'Multi-superficie',desc:'Mesones, puertas, sanitarios, equipos de cocina y laboratorio.'},
        {icon:'leaf',title:'Biodegradable',desc:'Activo biodegradable que no acumula toxinas en el ambiente.'},
      ],
      features:[
        {icon:'shield',title:'Grado hospitalario',desc:'Elimina virus y bacterias'},
        {icon:'drop',title:'Sin enjuague',desc:'Seguro al contacto'},
        {icon:'sparkle',title:'Amplio espectro',desc:'Bactericida, virucida y fungicida'},
      ],
      step2:'Pulveriza sobre la superficie, deja actuar 2-3 minutos y limpia con paño.',
      faqDilution:{show:true,text:'Úsalo puro para desinfección máxima. Puede diluirse 1:5 para limpieza de mantenimiento diario.'},
      reviews:[
        {text:'Lo uso en mi consultorio. Cumple con todos los estándares de desinfección.',name:'Dra. Carmen R.',city:'Bogotá',init:'C'},
        {text:'Desinfecta y deja las superficies brillantes. Dos funciones en una.',name:'Eduardo P.',city:'Cali',init:'E'},
        {text:'Desde que lo uso en casa, enfermamos mucho menos.',name:'Beatriz H.',city:'Medellín',init:'B'},
      ],
    },
    'desengrasante_profesional_biotu':{
      name:'Desengrasante Profesional Biotú',
      description:'Desengrasante de grado industrial para maquinaria, equipos y superficies de alta contaminación. Triple acción: desengrasa, limpia y desinfecta en un solo paso. Sin solventes clorados, seguro para metales y plásticos industriales.',
      category:'Línea Profesional · Biotú',
      benefits:[
        {icon:'drop',title:'Potencia industrial',desc:'Fórmula de grado industrial para grasa de maquinaria y equipos.'},
        {icon:'sparkle',title:'Acción triple',desc:'Desengrasa, limpia y desinfecta en un solo paso.'},
        {icon:'leaf',title:'Sin solventes clorados',desc:'Seguro para el usuario y el medio ambiente.'},
        {icon:'shield',title:'Compatible con metales',desc:'No corroe acero inoxidable, aluminio ni plásticos industriales.'},
      ],
      features:[
        {icon:'drop',title:'Grado industrial',desc:'Para maquinaria y equipos'},
        {icon:'sparkle',title:'Triple acción',desc:'Desengrasa, limpia y desinfecta'},
        {icon:'leaf',title:'Sin solventes clorados',desc:'Seguro y biodegradable'},
      ],
      step2:'Aplica sobre la superficie engrasada, deja actuar 2-5 minutos y retira con agua o paño.',
      faqDilution:{show:true,text:'Para uso industrial úsalo puro. Dilúye 1:5 para limpieza de mantenimiento en talleres.'},
      reviews:[
        {text:'En el taller limpiamos los motores con este producto. Excelente resultado.',name:'Marcos V.',city:'Bogotá',init:'M'},
        {text:'Quita la grasa industrial que ningún producto convencional puede eliminar.',name:'Rodrigo A.',city:'Bucaramanga',init:'R'},
        {text:'Lo usamos en la planta de producción. Cumple las normas y es muy eficaz.',name:'Gerencia Industrial',city:'Medellín',init:'G'},
      ],
    },
    'desengrasante_de_motores_biotu':{
      name:'Desengrasante de Motores Biotú',
      description:'Formulado especialmente para remover aceite, grasa carbonizada y combustible de motores y piezas mecánicas. Sin ácidos que corroan metales, plásticos o mangueras. Alta penetración en zonas de difícil acceso.',
      category:'Línea Automotriz · Biotú',
      benefits:[
        {icon:'drop',title:'Específico automotriz',desc:'Formulado para remover aceite, grasa y combustible de motores.'},
        {icon:'sparkle',title:'Sin ácidos',desc:'No corroe metales, plásticos ni mangueras del motor.'},
        {icon:'leaf',title:'Biodegradable',desc:'Fórmula ecológica sin solventes agresivos.'},
        {icon:'shield',title:'Alta penetración',desc:'Penetra en zonas de difícil acceso del motor.'},
      ],
      features:[
        {icon:'drop',title:'Para motores',desc:'Aceite, grasa y combustible'},
        {icon:'sparkle',title:'Sin ácidos',desc:'No corroe ni daña partes'},
        {icon:'leaf',title:'Eco-friendly',desc:'Biodegradable certificado'},
      ],
      step2:'Con el motor frío, aplica en las zonas a limpiar, deja actuar 5 minutos y enjuaga con agua a presión.',
      faqDilution:{show:true,text:'Para motores muy sucios úsalo puro. Dilúye 1:3 para mantenimiento regular.'},
      reviews:[
        {text:'Dejé el motor de mi camioneta como nuevo. Quitó años de grasa acumulada.',name:'Jorge M.',city:'Bogotá',init:'J'},
        {text:'En el taller lo usamos para todos los autos. Es nuestra primera opción.',name:'Mecánico Luis F.',city:'Medellín',init:'L'},
        {text:'Fácil de usar y muy eficaz. El motor quedó limpio y sin residuos.',name:'Ernesto V.',city:'Cali',init:'E'},
      ],
    },
    'shampoo_para_vehiculos_biotu':{
      name:'Shampoo para Vehículos Biotú',
      description:'Shampoo automotriz con cera natural que limpia y protege la pintura en un solo lavado. Espuma densa que levanta la suciedad sin rayar la carrocería. Compatible con lacas, metalizadas, perladas y pinturas mate.',
      category:'Línea Automotriz · Biotú',
      benefits:[
        {icon:'sparkle',title:'Brillo espejo',desc:'Deja la carrocería brillante con efecto espejo sin dañar la pintura.'},
        {icon:'drop',title:'Alta espuma',desc:'Espuma densa que levanta la suciedad sin rayar la superficie.'},
        {icon:'leaf',title:'Cera protectora',desc:'Contiene cera natural que protege y sella la pintura.'},
        {icon:'shield',title:'Seguro para todas las pinturas',desc:'Compatible con lacas, metalizadas, perladas y mate.'},
      ],
      features:[
        {icon:'sparkle',title:'Brillo espejo',desc:'Pintura como nueva'},
        {icon:'drop',title:'Cera incluida',desc:'Protege y brilla al mismo tiempo'},
        {icon:'leaf',title:'Seguro para pintura',desc:'Todas las lacas y acabados'},
      ],
      step2:'Dilúye 50ml en 5 litros de agua, lava el vehículo con esponja suave y enjuaga con abundante agua.',
      faqDilution:{show:true,text:'Dilúye 50ml en 5 litros de agua. Para mayor brillo aumenta a 70ml por cubeta.'},
      reviews:[
        {text:'Mi carro quedó brillante como en concesionario. La cera hace la diferencia.',name:'Andrés M.',city:'Bogotá',init:'A'},
        {text:'Lo uso en mi empresa de lavado de carros. Los clientes quedan encantados.',name:'Lavadero Premium',city:'Medellín',init:'L'},
        {text:'La espuma es increíble y el brillo que deja es de primera calidad.',name:'Carlos E.',city:'Cali',init:'C'},
      ],
    },
    'jabon_liquido_manos_y_cuerpo_biotu':{
      name:'Jabón Líquido Manos y Cuerpo Biotú',
      description:'Jabón líquido con pH 5.5 formulado para manos y cuerpo. Glicerina vegetal que hidrata con cada lavado. Acción antibacterial suave que elimina gérmenes sin resecar. Disponible en aromas Aconcagua, Amanecer y Coco y Avena.',
      category:'Línea Cuidado Personal · Biotú',
      benefits:[
        {icon:'leaf',title:'pH balanceado',desc:'Formulado con pH 5.5, igual al de la piel sana, para máxima suavidad.'},
        {icon:'drop',title:'Hidratante',desc:'Glicerina vegetal que hidrata y protege la piel con cada lavado.'},
        {icon:'sparkle',title:'Antibacterial suave',desc:'Elimina gérmenes sin resecar gracias a su fórmula dermatológica.'},
        {icon:'shield',title:'Aromas exclusivos',desc:'Disponible en Aconcagua, Amanecer y Coco y Avena.'},
      ],
      features:[
        {icon:'leaf',title:'pH 5.5',desc:'Igual al de la piel sana'},
        {icon:'drop',title:'Con glicerina',desc:'Hidrata con cada lavado'},
        {icon:'sparkle',title:'Aromas premium',desc:'3 fragancias disponibles'},
      ],
      step2:'Coloca la cantidad deseada en la palma de la mano húmeda y aplica en el cuerpo o manos.',
      faqDilution:{show:false},
      reviews:[
        {text:'Mis manos quedaron suaves y sin resecarse. El aroma Aconcagua es hermoso.',name:'Valentina R.',city:'Bogotá',init:'V'},
        {text:'La fragancia Coco y Avena es deliciosa. La piel queda hidratada todo el día.',name:'Stephanie M.',city:'Medellín',init:'S'},
        {text:'Por fin un jabón que no me reseca las manos con el uso frecuente.',name:'Enfermera Paula A.',city:'Cali',init:'P'},
      ],
    },
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (p) =>
    new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0}).format(p||0);

  const ICONS = {
    drop:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    leaf:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22c1.25-1.25 2.5-2.5 3.75-3.75C7 17 9 17 12 15c4-3 6-7 6-10C15 3 11 3 8 5 5 7 4 10 3 13c-1.5 4-1.5 6 0 9"/></svg>',
    sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.8L20 10l-4.5 4.4 1.1 6.3L12 18l-4.6 2.7 1.1-6.3L4 10l6.1-1.2z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  };
  const ico = (n) => ICONS[n] || ICONS.sparkle;

  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.533 5.857L.057 23.743a.5.5 0 0 0 .615.644l6.066-1.59A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.673-.5-5.213-1.378l-.374-.219-3.875 1.016 1.031-3.77-.24-.388A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';

  const stockInfo = (s) => {
    if(s>10) return {cls:'green', txt:'🟢 Disponible'};
    if(s>=5)  return {cls:'yellow',txt:'🟡 Pocas unidades'};
    if(s>=1)  return {cls:'red',   txt:'🔴 Últimas unidades'};
    return      {cls:'gray',  txt:'⚫ Agotado'};
  };

  const buildWaLink = (name,variant,price) => {
    const msg = encodeURIComponent(
      `Hola Equora! Me interesa cotizar:\n\n*Producto:* ${name}\n*Presentación:* ${variant}\n*Precio:* ${fmt(price)}\n\n¿Tienen disponibilidad?`
    );
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
  };

  const $ = (id) => document.getElementById(id);
  const set = (id,val,prop='textContent') => { const el=$(id); if(el) el[prop]=val; };

  // ── Boot ──────────────────────────────────────────────────────────────────
  if(typeof PAGE_SLUG_KEY === 'undefined'){
    document.body.innerHTML='<p style="padding:40px;font-family:sans-serif">Error: PAGE_SLUG_KEY no definido.</p>';
    return;
  }
  const shopifySlug = SLUG_MAP[PAGE_SLUG_KEY];
  if(!shopifySlug){
    document.body.innerHTML='<p style="padding:40px;font-family:sans-serif">Producto no encontrado.</p>';
    return;
  }
  const localImg = IMAGE_MAP[shopifySlug] || '';
  const content  = PRODUCT_CONTENT[shopifySlug] || {};

  // Pre-set local image immediately (before API)
  const galleryMainImg = $('gallery-main-img');
  const descImg        = $('desc-img');
  if(localImg){
    if(galleryMainImg){ galleryMainImg.src=localImg; galleryMainImg.alt=content.name||shopifySlug; }
    if(descImg){ descImg.src=localImg; descImg.alt=content.name||shopifySlug; }
  }

  // State
  let product=null, allProducts=[], selectedVariant=null;

  // ── Hamburger ─────────────────────────────────────────────────────────────
  const ham=$('hamburger'), menu=$('mobile-menu');
  if(ham&&menu) ham.addEventListener('click',()=>{ ham.classList.toggle('open'); menu.classList.toggle('open'); });

  // ── Tabs ──────────────────────────────────────────────────────────────────
  function activateTab(tabKey){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    const btn=document.querySelector(`.tab-btn[data-tab="${tabKey}"]`);
    const panel=document.querySelector(`[data-panel="${tabKey}"]`);
    if(btn)   btn.classList.add('active');
    if(panel) panel.classList.add('active');
  }

  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>activateTab(btn.dataset.tab));
  });

  // Nav links que apuntan a secciones de tabs → activar el tab correcto
  // y hacer scroll suave al contenedor de tabs
  const NAV_TAB_MAP = {
    '#descripcion':    'desc',
    '#presentaciones': 'pres',
  };
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    const hash = link.getAttribute('href');
    const tabKey = NAV_TAB_MAP[hash];
    if(!tabKey) return;
    link.addEventListener('click', e=>{
      e.preventDefault();
      activateTab(tabKey);
      const tabsSection = document.querySelector('.tabs-section');
      if(tabsSection){
        // pequeño delay para que el tab cambie antes del scroll
        setTimeout(()=>tabsSection.scrollIntoView({behavior:'smooth', block:'start'}), 30);
      }
    });
  });

  // ── Botones "Agregar al carrito" ─────────────────────────────────────────
  // Inyecta un botón de carrito junto a cada CTA de WhatsApp.
  // Se llama desde renderStatic() — sin necesidad de API.
  const CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

  function injectCartButtons(productName){
    const url = TIENDA_BASE + '/tienda?producto=' + encodeURIComponent(productName);

    function makeBtn(id, cls, label){
      const a = document.createElement('a');
      a.id = id; a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.className = cls;
      a.innerHTML = CART_SVG + (label ? ' ' + label : '');
      if(!label) a.title = 'Agregar al carrito';
      return a;
    }

    // 1. Hero CTA — insertar después del botón WhatsApp
    const heroWa = $('hero-wa-btn');
    if(heroWa && !$('hero-cart-btn')){
      heroWa.parentNode.insertBefore(makeBtn('hero-cart-btn','btn btn-cart','Agregar al carrito'), heroWa.nextSibling);
    }

    // 2. CTA block inferior — insertar después del botón WhatsApp
    const ctaWa = $('cta-wa-btn');
    if(ctaWa && !$('cta-cart-btn')){
      ctaWa.parentNode.insertBefore(makeBtn('cta-cart-btn','btn btn-cart','Agregar al carrito'), ctaWa.nextSibling);
    }

    // 3. Sticky bar — insertar antes del botón WhatsApp
    const barWa = $('bar-wa-btn');
    if(barWa && !$('bar-cart-btn')){
      barWa.parentNode.insertBefore(makeBtn('bar-cart-btn','bar-cart-btn'), barWa);
    }
  }

  // ── PASO 1: Renderizar contenido estático inmediatamente ──────────────────
  // (benefits, features, step2, reviews, faq, category)
  // No necesita API — se muestra de inmediato
  function renderStatic(){
    // Hero category y título provisional
    set('hero-category', content.category || 'Biotú · Línea Professional');
    if(content.name){
      set('hero-title', content.name);
      document.title = `${content.name} | Equora Distribuciones`;
    }
    if(content.description) set('hero-desc', content.description);

    // SEO provisional
    if(content.description){
      const md=$('meta-desc'); if(md) md.content=content.description;
      const od=$('og-desc');   if(od) od.content=content.description;
    }
    if(content.name){
      const ot=$('og-title'); if(ot) ot.content=content.name;
    }

    // Descripción tab — título y texto
    set('desc-title', content.name || '');
    const dtxt=$('desc-text');
    if(dtxt && content.description){
      dtxt.innerHTML = content.description.split('. ')
        .filter(s=>s.trim())
        .map(s=>`<p>${s.trim().replace(/\.$/,'')}.</p>`)
        .join('');
    }

    // Features (íconos descriptivos)
    const featsEl=$('desc-features');
    if(featsEl && content.features){
      featsEl.innerHTML = content.features.map(f=>`
        <div class="desc-feature">
          <div class="desc-feature-icon">${ico(f.icon)}</div>
          <div class="desc-feature-text"><strong>${f.title}</strong><span>${f.desc}</span></div>
        </div>`).join('');
    }

    // Benefits tab
    const benEl=$('benefits-grid');
    if(benEl && content.benefits){
      benEl.innerHTML = content.benefits.map(b=>`
        <div class="benefit">
          <div class="benefit-ico">${ico(b.icon)}</div>
          <h3>${b.title}</h3>
          <p>${b.desc}</p>
        </div>`).join('');
    }

    // Step 2
    if(content.step2) set('step2-text', content.step2);

    // FAQ dilución
    if(content.faqDilution && content.faqDilution.show){
      const fd=$('faq-dilution'); if(fd) fd.style.display='';
      set('faq-dilution-text', content.faqDilution.text);
    }

    // Reviews
    if(content.reviews && content.reviews.length>=3){
      [0,1,2].forEach(i=>{
        const r=content.reviews[i], n=i+1;
        set(`rev${n}-text`,  `"${r.text}"`);
        set(`rev${n}-name`,  r.name);
        set(`rev${n}-city`,  r.city);
        set(`rev${n}-avatar`,r.init);
      });
    }

    // Botones carrito (usa nombre del producto desde PRODUCT_CONTENT)
    const productNameForCart = content.name || 'Producto Biotú';
    injectCartButtons(productNameForCart);
  }

  // ── PASO 2: Actualizar con datos dinámicos de la API ──────────────────────
  // (variantes, precios, stock, descripción oficial de Shopify, relacionados)
  function renderDynamic(){
    if(!product) return;

    // Sobrescribir título y descripción si Shopify tiene datos
    if(product.nombre){
      set('hero-title', product.nombre);
      set('desc-title', product.nombre);
      document.title = `${product.nombre} | Equora Distribuciones`;
      const ot=$('og-title'); if(ot) ot.content=product.nombre;
    }
    if(product.descripcion){
      set('hero-desc', product.descripcion);
      const dtxt=$('desc-text');
      if(dtxt) dtxt.innerHTML = product.descripcion.split('. ')
        .filter(s=>s.trim())
        .map(s=>`<p>${s.trim().replace(/\.$/,'')}.</p>`)
        .join('');
      const md=$('meta-desc'); if(md) md.content=product.descripcion;
      const od=$('og-desc');   if(od) od.content=product.descripcion;
    }

    // Gallery thumbs con imágenes de Shopify (sin duplicados)
    const thumbsEl=$('gallery-thumbs');
    if(thumbsEl){
      // Deduplicar URLs de Shopify con Set
      const remote=[...new Set((product.imagenes||[]).filter(Boolean))];

      if(remote.length>0){
        // Shopify tiene imágenes → usarlas exclusivamente (no mezclar local)
        if(galleryMainImg) galleryMainImg.src=remote[0];

        if(remote.length>1){
          thumbsEl.innerHTML=remote.slice(0,5).map((u,i)=>`
            <div class="gallery-thumb${i===0?' active':''}" data-img="${u}">
              <img src="${u}" alt="" loading="lazy"/>
            </div>`).join('');
          thumbsEl.querySelectorAll('.gallery-thumb').forEach(th=>{
            th.addEventListener('click',()=>{
              thumbsEl.querySelectorAll('.gallery-thumb').forEach(t=>t.classList.remove('active'));
              th.classList.add('active');
              if(galleryMainImg) galleryMainImg.src=th.dataset.img;
            });
          });
        } else {
          // Solo 1 imagen de Shopify → no mostrar thumbs
          thumbsEl.innerHTML='';
        }
      }
      // Si remote.length === 0: se mantiene el localImg que se cargó al inicio
    }

    // Meta strip
    set('meta-precio', fmt(product.precioBajo));
    set('meta-stock',  product.stockTotal>0 ? String(product.stockTotal) : '0');

    // Variantes
    renderVariants();

    // Tabla de presentaciones
    renderPresTable();

    // Productos relacionados
    renderRelated();
  }

  function renderVariants(){
    if(!product) return;
    const grid=$('variants-grid'); if(!grid) return;

    if(!product.variantes || !product.variantes.length){
      grid.innerHTML='<p style="color:var(--muted);font-size:14px">Sin variantes disponibles.</p>';
      return;
    }

    grid.innerHTML=product.variantes.map((v,i)=>`
      <button class="variant-btn${i===0?' active':''} ${v.disponible?'':'out-of-stock'}" data-idx="${i}">
        <span class="v-name">${v.nombre}</span>
        <span class="v-price">${fmt(v.precio)}</span>
        <span class="v-stock">${v.disponible?(v.stock>0?`${v.stock} unid.`:'Disponible'):'Agotado'}</span>
      </button>`).join('');

    grid.querySelectorAll('.variant-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(btn.classList.contains('out-of-stock')) return;
        grid.querySelectorAll('.variant-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        selectedVariant=product.variantes[+btn.dataset.idx];
        updateLinks(); updateBadge(); updateBar();
      });
    });

    // Seleccionar primera disponible
    selectedVariant=product.variantes.find(v=>v.disponible)||product.variantes[0];
    if(selectedVariant){
      const idx=product.variantes.indexOf(selectedVariant);
      grid.querySelectorAll('.variant-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
    }
    updateLinks(); updateBadge(); updateBar();
  }

  function updateBadge(){
    const el=$('stock-badge-wrap'); if(!el) return;
    if(!selectedVariant){el.innerHTML='';return;}
    const s=selectedVariant.disponible?(selectedVariant.stock||1):0;
    const info=stockInfo(s);
    el.innerHTML=`<span class="stock-badge ${info.cls}" style="margin-bottom:16px">${info.txt}</span>`;
  }

  function updateBar(){
    if(!selectedVariant) return;
    set('bar-price', fmt(selectedVariant.precio));
  }

  function updateLinks(){
    if(!selectedVariant) return;
    const name = (product&&product.nombre) || content.name || 'Producto Biotú';
    const link  = buildWaLink(name, selectedVariant.nombre, selectedVariant.precio);
    ['nav-wa-cta','hero-wa-btn','cta-wa-btn','bar-wa-btn','wa-fab'].forEach(id=>{
      const el=$(id); if(el) el.href=link;
    });
  }

  function renderPresTable(){
    if(!product) return;
    const tbody=$('pres-tbody'); if(!tbody) return;
    if(!product.variantes||!product.variantes.length){
      tbody.innerHTML='<tr><td colspan="4" style="padding:20px;color:var(--muted)">Sin presentaciones disponibles en este momento.</td></tr>';
      return;
    }
    const name=(product&&product.nombre)||content.name||'Producto Biotú';
    tbody.innerHTML=product.variantes.map(v=>{
      const s=v.disponible?(v.stock||1):0;
      const si=stockInfo(s);
      const link=buildWaLink(name,v.nombre,v.precio);
      return `<tr>
        <td><strong>${v.nombre}</strong>${v.sku?`<br><small style="color:var(--muted)">SKU: ${v.sku}</small>`:''}</td>
        <td class="price-cell">${fmt(v.precio)}</td>
        <td><span class="pres-available ${si.cls}">${si.txt}</span></td>
        <td><a href="${link}" target="_blank" rel="noopener" class="pres-cta">
          ${WA_SVG} Cotizar
        </a></td>
      </tr>`;
    }).join('');
  }

  function renderRelated(){
    const grid=$('related-grid'); if(!grid) return;
    const others=allProducts.filter(p=>p.slug!==shopifySlug).slice(0,4);
    if(!others.length){ const sec=grid.closest('section'); if(sec) sec.style.display='none'; return; }
    grid.innerHTML=others.map(p=>{
      const img=IMAGE_MAP[p.slug]||'';
      const landing=LANDING_MAP[p.slug]||'index.html';
      return `<a href="${landing}" class="related-card">
        <div class="related-img">${img?`<img src="${img}" alt="${p.nombre}" loading="lazy"/>`:''}</div>
        <div class="related-info">
          <h4>${p.nombre}</h4>
          <div class="related-price">${fmt(p.precioBajo)}</div>
          <div class="related-btn">${WA_SVG} Ver producto</div>
        </div>
      </a>`;
    }).join('');
  }

  // ── Fetch API ─────────────────────────────────────────────────────────────
  async function loadProduct(){
    // Mostrar loading solo en las secciones dinámicas
    const grid=$('variants-grid');
    if(grid) grid.innerHTML='<div class="skeleton" style="width:100%;height:62px;border-radius:12px"></div>';
    const bp=$('bar-price');
    if(bp) bp.textContent='Cargando…';

    try{
      const [r1,r2]=await Promise.all([
        fetch(`${API_BASE}/api/productos/${shopifySlug}`),
        fetch(`${API_BASE}/api/productos`),
      ]);
      if(!r1.ok) throw new Error(`HTTP ${r1.status} para ${shopifySlug}`);

      const raw1 = await r1.json();
      const raw2 = r2.ok ? await r2.json() : {};

      // El controlador envuelve: { success, producto, metaTags }
      // Si ya viene sin envolver (objeto plano con .nombre), lo usamos directo
      product = raw1.producto || raw1;

      // El controlador envuelve: { success, count, productos, cacheStats }
      allProducts = raw2.productos || (Array.isArray(raw2) ? raw2 : []);

      renderDynamic();
    } catch(e){
      console.error('[landing-app]', e.message);
      // Solo mostrar error en sección de variantes — el resto ya mostró contenido estático
      const g=$('variants-grid');
      if(g) g.innerHTML=`<p style="color:var(--muted);font-size:13.5px;padding:4px 0">
        ⚠️ No se pudo conectar con el servidor. Contáctanos por WhatsApp para conocer precios y disponibilidad.
      </p>`;
      const vs=$('variant-selector');
      // Ocultar botón CTA si no hay variante seleccionada
      const hwb=$('hero-wa-btn');
      if(hwb){
        const name=content.name||'Producto Biotú';
        const waFallback=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola Equora! Quiero cotizar: ${name}`)}`;
        ['nav-wa-cta','hero-wa-btn','cta-wa-btn','bar-wa-btn','wa-fab'].forEach(id=>{
          const el=$(id); if(el) el.href=waFallback;
        });
      }
      const bp2=$('bar-price'); if(bp2) bp2.textContent='Consultar precio';
    }
  }

  // ── Arrancar ──────────────────────────────────────────────────────────────
  renderStatic();   // inmediato — sin API
  loadProduct();    // async — precios/stock/variantes

})();
