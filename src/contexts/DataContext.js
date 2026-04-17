import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadData, saveData } from '../utils/storage';
import api from '../utils/api';
import { formatWord } from '../utils/helpers';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const loaded = loadData();
    loaded.kateqoriyalar = [];
    loaded.rengler = [];
    loaded.olculer = [];
    loaded.techizatcilar = [];
    loaded.magazaMelumat = { ad: '', unvan: '', telefon: '' };
    return loaded;
  });
  const [sablonlar, setSablonlar] = useState([]);
  const [sebet, setSebet] = useState([]);

  const fetchParameters = useCallback(async () => {
    try {
      const [catRes, colRes, sizeRes, supRes, tplRes, storeRes] = await Promise.all([
        api.get('/parameters/category'),
        api.get('/parameters/color'),
        api.get('/parameters/size'),
        api.get('/parameters/supplier'),
        api.get('/parameters/template'),
        api.get('/store-settings')
      ]);
      const catData = catRes.data?.data || catRes.data || [];
      const colData = colRes.data?.data || colRes.data || [];
      const sizeData = sizeRes.data?.data || sizeRes.data || [];
      const supData = supRes.data?.data || supRes.data || [];
      const storeData = storeRes.data?.data || storeRes.data || {};
      
      setData((prev) => ({
        ...prev,
        kateqoriyalar: catData.map(c => ({ id: c.id, nov_adi: c.name })),
        rengler: colData.map(r => ({ id: r.id, ad: r.name, kod: r.hexCode || '#ccc' })),
        olculer: sizeData.map(s => ({ id: s.id, ad: s.name })),
        techizatcilar: supData.map(t => ({ id: t.id, ad: t.name, tel: t.contact })),
        magazaMelumat: storeData
      }));
      setSablonlar(tplRes.data?.data || tplRes.data || []);
    } catch(err) {
      console.error('API Fetch Hatası:', err);
    }
  }, []);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);
  const [yeniMehsullar, setYeniMehsullar] = useState([]);
  const [umumiEndirim, setUmumiEndirim] = useState({ tipi: null, deyer: 0 });

  const refreshData = useCallback(() => {
    setData(loadData());
  }, []);

  const updateData = useCallback((newData) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      saveData(updated);
      return updated;
    });
  }, []);

  const addSatis = useCallback((satis) => {
    setData((prev) => {
      const updated = {
        ...prev,
        satislar: [...prev.satislar, satis],
        anbar: prev.anbar.map((m) => {
          const satisMehsul = satis.mehsullar.find((sm) => sm.mal_id === m.id);
          if (satisMehsul) {
            return { ...m, qaliq: m.qaliq - satisMehsul.miqdar };
          }
          return m;
        }),
      };
      saveData(updated);
      return updated;
    });
    setSebet([]);
    setUmumiEndirim({ tipi: null, deyer: 0 });
  }, []);

  const addQaytarma = useCallback((satisId, qaytarma) => {
    setData((prev) => {
      const updatedSatislar = prev.satislar.map((s) => {
        if (s.id === satisId) {
          const updatedSatis = {
            ...s,
            qaytarmalar: [...(s.qaytarmalar || []), qaytarma],
          };
          // Recalculate totals
          const qaytarilanMebleg = updatedSatis.qaytarmalar.reduce(
            (sum, q) => sum + q.toplam_mebleg,
            0
          );
          updatedSatis.qaytarilan_mebleg = qaytarilanMebleg;
          return updatedSatis;
        }
        return s;
      });
      const updated = { ...prev, satislar: updatedSatislar };
      saveData(updated);
      return updated;
    });
  }, []);

  const addXerc = useCallback((xerc) => {
    setData((prev) => {
      const updated = { ...prev, xercler: [...prev.xercler, xerc] };
      saveData(updated);
      return updated;
    });
  }, []);

  const deleteXerc = useCallback((xercId) => {
    setData((prev) => {
      const updated = { ...prev, xercler: prev.xercler.filter((x) => x.id !== xercId) };
      saveData(updated);
      return updated;
    });
  }, []);

  const addQaime = useCallback((qaime) => {
    setData((prev) => {
      const updatedAnbar = [...prev.anbar];
      qaime.mehsullar.forEach((m) => {
        const mevcut = updatedAnbar.find(
          (a) => a.mal_kod === m.mal_kod && a.reng_id === m.reng_id && a.olcu_id === m.olcu_id
        );
        if (mevcut) {
          mevcut.qaliq += m.miqdar;
          mevcut.alis_qiymeti = m.alis_qiymeti;
          mevcut.satis_qiymeti = m.satis_qiymeti;
        } else {
          updatedAnbar.push({
            id: Date.now() + Math.random(),
            mal_kod: m.mal_kod,
            mal_adi: m.mal_adi,
            nov_id: m.nov_id,
            nov_adi: m.nov_adi,
            reng_id: m.reng_id || null,
            reng_adi: m.reng_adi || '',
            reng_kod: m.reng_kod || '',
            olcu_id: m.olcu_id,
            olcu_adi: m.olcu_adi,
            qaliq: m.miqdar,
            alis_qiymeti: m.alis_qiymeti,
            satis_qiymeti: m.satis_qiymeti,
          });
        }
      });
      const updated = { ...prev, qaimeler: [...prev.qaimeler, qaime], anbar: updatedAnbar };
      saveData(updated);
      return updated;
    });
    setYeniMehsullar([]);
  }, []);

  const deleteAnbarItem = useCallback((id) => {
    setData((prev) => {
      const updated = { ...prev, anbar: prev.anbar.filter((m) => m.id !== id) };
      saveData(updated);
      return updated;
    });
  }, []);

  const addKateqoriya = useCallback(async (kateqoriya) => {
    try { 
      await api.post('/parameters/category', { name: formatWord(kateqoriya.nov_adi) }); 
      fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const deleteKateqoriya = useCallback(async (id) => {
    try { await api.delete(`/parameters/category/${id}`); fetchParameters(); } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const addReng = useCallback(async (reng) => {
    try { 
      await api.post('/parameters/color', { name: formatWord(reng.ad), hexCode: reng.kod }); 
      fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const deleteReng = useCallback(async (id) => {
    try { await api.delete(`/parameters/color/${id}`); fetchParameters(); } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const addOlcu = useCallback(async (olcu) => {
    try { 
      await api.post('/parameters/size', { name: formatWord(olcu.ad) }); 
      fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const deleteOlcu = useCallback(async (id) => {
    try { await api.delete(`/parameters/size/${id}`); fetchParameters(); } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const addTechizatci = useCallback(async (techizatci) => {
    try { 
       await api.post('/parameters/supplier', { name: formatWord(techizatci.ad), contact: techizatci.tel }); 
       fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const deleteTechizatci = useCallback(async (id) => {
    try { await api.delete(`/parameters/supplier/${id}`); fetchParameters(); } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const addTemplate = useCallback(async (template) => {
    try { 
      const payload = {
        name: formatWord(template.sablon_adi),
        categoryId: template.kateqoriya_id,
        colorId: template.reng_id || null,
        sizeId: template.olcu_id || null
      };
      await api.post('/parameters/template', payload); 
      fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const deleteTemplate = useCallback(async (id) => {
    try { await api.delete(`/parameters/template/${id}`); fetchParameters(); } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const updateMagazaMelumat = useCallback(async (magazaMelumat) => {
    try { 
      await api.patch('/store-settings', { 
        name: magazaMelumat.ad, 
        address: magazaMelumat.unvan, 
        phone: magazaMelumat.telefon 
      }); 
      fetchParameters(); 
    } catch (e) { console.error(e); }
  }, [fetchParameters]);

  const clearAll = useCallback(() => {
    setData({
      anbar: [],
      kateqoriyalar: [],
      rengler: [],
      olculer: [],
      techizatcilar: [],
      qaimeler: [],
      satislar: [],
      xercler: [],
      magazaMelumat: { ad: '', unvan: '', telefon: '' },
    });
    localStorage.removeItem('erpData');
    setSebet([]);
    setYeniMehsullar([]);
    setUmumiEndirim({ tipi: null, deyer: 0 });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        sebet,
        setSebet,
        yeniMehsullar,
        setYeniMehsullar,
        umumiEndirim,
        setUmumiEndirim,
        refreshData,
        updateData,
        addSatis,
        addQaytarma,
        addXerc,
        deleteXerc,
        addQaime,
        deleteAnbarItem,
        addKateqoriya,
        deleteKateqoriya,
        addReng,
        deleteReng,
        addOlcu,
        deleteOlcu,
        addTechizatci,
        deleteTechizatci,
        addTemplate,
        deleteTemplate,
        sablonlar,
        updateMagazaMelumat,
        clearAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
