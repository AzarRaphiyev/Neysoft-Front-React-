const DEFAULT_DATA = {
  anbar: [],
  kateqoriyalar: [
    { id: 1, nov_adi: 'Papaq' },
    { id: 2, nov_adi: '\u015ealvar' },
    { id: 3, nov_adi: 'T-Shirt' },
    { id: 4, nov_adi: 'Cins' },
    { id: 5, nov_adi: 'Klassik ayaqqab\u0131' },
    { id: 6, nov_adi: 'Krasofka' },
    { id: 7, nov_adi: 'Palto' },
    { id: 8, nov_adi: 'Kurtka' },
    { id: 9, nov_adi: 'K\u00F6yn\u0259k' },
  ],
  rengler: [
    { id: 1, ad: 'Qara', kod: '#000000' },
    { id: 2, ad: 'A\u011F', kod: '#FFFFFF' },
    { id: 3, ad: 'Q\u0131rm\u0131z\u0131', kod: '#FF0000' },
    { id: 4, ad: 'G\u00F6y', kod: '#0000FF' },
    { id: 5, ad: 'Ya\u015F\u0131l', kod: '#008000' },
    { id: 6, ad: 'Sar\u0131', kod: '#FFFF00' },
    { id: 7, ad: 'Nar\u0131nc\u0131', kod: '#FFA500' },
    { id: 8, ad: 'B\u0259nov\u015F\u0259yi', kod: '#800080' },
  ],
  olculer: [
    { id: 1, ad: 'S' },
    { id: 2, ad: 'M' },
    { id: 3, ad: 'L' },
    { id: 4, ad: 'XL' },
    { id: 5, ad: 'XXL' },
    { id: 6, ad: 'XXXL' },
    { id: 7, ad: '36' },
    { id: 8, ad: '37' },
    { id: 9, ad: '38' },
    { id: 10, ad: '39' },
    { id: 11, ad: '40' },
    { id: 12, ad: '41' },
    { id: 13, ad: '42' },
    { id: 14, ad: '43' },
    { id: 15, ad: '44' },
  ],
  techizatcilar: [],
  qaimeler: [],
  satislar: [],
  xercler: [],
  magazaMelumat: {
    ad: 'MA\u011EAZA ADI',
    unvan: 'Bak\u0131 \u015F\u0259h., N\u0259simi ray.',
    telefon: '+994 XX XXX XX XX',
  },
};

export function loadData() {
  try {
    const saved = localStorage.getItem('erpData');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_DATA,
        anbar: parsed.anbar || [],
        satislar: parsed.satislar || [],
        xercler: parsed.xercler || [],
        qaimeler: parsed.qaimeler || [],
        qaytarmalar: parsed.qaytarmalar || [],
        techizatcilar: parsed.techizatcilar || [],
        magazaMelumat: parsed.magazaMelumat || DEFAULT_DATA.magazaMelumat,
        kateqoriyalar: parsed.kateqoriyalar || DEFAULT_DATA.kateqoriyalar,
        rengler: parsed.rengler || DEFAULT_DATA.rengler,
        olculer: parsed.olculer || DEFAULT_DATA.olculer,
      };
    }
  } catch (e) {
    console.log('K\u00F6hn\u0259 m\u0259lumatlar y\u00FCkl\u0259nm\u0259di, yeni ba\u015Flay\u0131r\u0131q');
  }
  return { ...DEFAULT_DATA };
}

export function saveData(data) {
  try {
    const dataToSave = {
      anbar: data.anbar,
      satislar: data.satislar,
      xercler: data.xercler,
      qaimeler: data.qaimeler,
      qaytarmalar: data.qaytarmalar,
      techizatcilar: data.techizatcilar,
      magazaMelumat: data.magazaMelumat,
      kateqoriyalar: data.kateqoriyalar,
      rengler: data.rengler,
      olculer: data.olculer,
    };
    localStorage.setItem('erpData', JSON.stringify(dataToSave));
  } catch (e) {
    console.log('M\u0259lumat saxlan\u0131lmad\u0131:', e.message);
  }
}

export function clearAllData() {
  localStorage.removeItem('erpData');
}
