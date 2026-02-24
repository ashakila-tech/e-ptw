import React from "react";
import DropDownPicker from "react-native-dropdown-picker";

export default function DropdownField({
  open,
  value,
  items,
  setOpen,
  setValue,
  setItems,
  placeholder,
  zIndex,
  multiple,
}: any) {
  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder={placeholder}
      multiple={multiple}
      listMode="MODAL"
      zIndex={zIndex}
      style={{ borderColor: "#d1d5db", borderRadius: 16 }}
      dropDownContainerStyle={{ borderColor: "#d1d5db", borderRadius: 16 }}
    />
  );
}
