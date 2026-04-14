import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const [sebet, setSebet] = useState([]);
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

  const addKateqoriya = useCallback((kateqoriya) => {
    setData((prev) => {
      const updated = { ...prev, kateqoriyalar: [...prev.kateqoriyalar, kateqoriya] };
      saveData(updated);
      return updated;
    });
  }, []);

  const deleteKateqoriya = useCallback((id) => {
    setData((prev) => {
      const updated = { ...prev, kateqoriyalar: prev.kateqoriyalar.filter((k) => k.id !== id) };
      saveData(updated);
      return updated;
    });
  }, []);

  const addReng = useCallback((reng) => {
    setData((prev) => {
      const updated = { ...prev, rengler: [...prev.rengler, reng] };
      saveData(updated);
      return updated;
    });
  }, []);

  const deleteReng = useCallback((id) => {
    setData((prev) => {
      const updated = { ...prev, rengler: prev.rengler.filter((r) => r.id !== id) };
      saveData(updated);
      return updated;
    });
  }, []);

  const addOlcu = useCallback((olcu) => {
    setData((prev) => {
      const updated = { ...prev, olculer: [...prev.olculer, olcu] };
      saveData(updated);
      return updated;
    });
  }, []);

  const deleteOlcu = useCallback((id) => {
    setData((prev) => {
      const updated = { ...prev, olculer: prev.olculer.filter((o) => o.id !== id) };
      saveData(updated);
      return updated;
    });
  }, []);

  const addTechizatci = useCallback((techizatci) => {
    setData((prev) => {
      const updated = { ...prev, techizatcilar: [...prev.techizatcilar, techizatci] };
      saveData(updated);
      return updated;
    });
  }, []);

  const deleteTechizatci = useCallback((id) => {
    setData((prev) => {
      const updated = { ...prev, techizatcilar: prev.techizatcilar.filter((t) => t.id !== id) };
      saveData(updated);
      return updated;
    });
  }, []);

  const updateMagazaMelumat = useCallback((magazaMelumat) => {
    setData((prev) => {
      const updated = { ...prev, magazaMelumat };
      saveData(updated);
      return updated;
    });
  }, []);

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
