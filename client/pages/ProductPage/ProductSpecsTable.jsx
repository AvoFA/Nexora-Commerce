const ProductSpecsTable = ({ attributes }) => {
  const groups = {
    Екран: [
      "Діагональ",
      "Діагональ екрану",
      "Роздільна здатність",
      "Тип матриці",
      "Частота оновлення",
      "Яскравість",
    ],
    "Процесор та Пам'ять": [
      "Процесор",
      "Оперативна пам'ять",
      "Вбудована пам'ять",
      "RAM",
      "SSD",
      "Пам'ять",
      "Тип пам'яті",
      "Відеокарта",
    ],
    Камера: [
      "Основна камера",
      "Фронтальна камера",
      "Камера",
      "Запис відео",
    ],
    "Зв'язок та ОС": [
      "SIM",
      "Кількість SIM-карт",
      "Операційна система",
      "NFC",
      "Bluetooth",
      "Wi-Fi",
      "Версія ОС",
    ],
    Корпус: [
      "Колір",
      "Матеріал корпусу",
      "Вага",
      "Габарити",
      "Захист",
      "Комплектація",
    ],
  };

  const safeAttributes = attributes || [];
  const usedKeys = new Set();

  const activeGroups = Object.entries(groups).filter(([_, keys]) =>
    safeAttributes.some((attr) => keys.includes(attr.key)),
  );

  return (
    <section className="characteristics-section">
      <h2 className="section-title">Характеристики</h2>

      <div className="specs-table-box">
        {activeGroups.map(([groupName, keys]) => {
          const groupSpecs = safeAttributes.filter((attr) =>
            keys.includes(attr.key),
          );
          groupSpecs.forEach((attr) => usedKeys.add(attr.key));

          return (
            <div key={groupName} className="specs-table-group">
              <div className="group-header">{groupName}</div>
              <div className="group-rows">
                {groupSpecs.map((spec, idx) => (
                  <div key={idx} className="spec-row-grid">
                    <div className="spec-key">{spec.key}</div>
                    <div className="spec-value">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {safeAttributes.filter((attr) => !usedKeys.has(attr.key)).length > 0 && (
          <div className="specs-table-group">
            <div className="group-header">Інші характеристики</div>
            <div className="group-rows">
              {safeAttributes
                .filter((attr) => !usedKeys.has(attr.key))
                .map((spec, idx) => (
                  <div key={idx} className="spec-row-grid">
                    <div className="spec-key">{spec.key}</div>
                    <div className="spec-value">{spec.value}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSpecsTable;
