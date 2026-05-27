import CategoryAttributesManager from "../CategoryAttributesManager.jsx";

const CategoryAttributesTab = ({
  formData,
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => {
  return (
    <CategoryAttributesManager
      attributes={formData.defaultAttributes}
      onAddGroup={onAddGroup}
      onRemoveGroup={onRemoveGroup}
      onGroupNameChange={onGroupNameChange}
      onAddItem={onAddItem}
      onRemoveItem={onRemoveItem}
      onItemChange={onItemChange}
    />
  );
};

export default CategoryAttributesTab;
