"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComboboxProps<T extends string> {
  items: readonly T[] | T[];
  children: React.ReactNode;
  value?: T;
  onValueChange?: (value: T) => void;
}

const ComboboxContext = React.createContext<any>(null);

export function Combobox<T extends string>({ items, children, value: externalValue, onValueChange }: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(externalValue || "");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const value = externalValue !== undefined ? externalValue : selectedValue;

  const handleSelect = (val: string) => {
    if (onValueChange) {
      onValueChange(val as T);
    } else {
      setSelectedValue(val);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <ComboboxContext.Provider
      value={{
        isOpen,
        setIsOpen,
        value,
        searchQuery,
        setSearchQuery,
        filteredItems,
        handleSelect,
      }}
    >
      <div className="relative w-full">{children}</div>
    </ComboboxContext.Provider>
  );
}

export function ComboboxInput({ placeholder }: { placeholder?: string }) {
  const { setIsOpen, value, searchQuery, setSearchQuery } = React.useContext(ComboboxContext);

  return (
    <div
      className="flex items-center justify-between w-full py-3 bg-transparent border-b border-white/10 text-foreground outline-none cursor-pointer group"
      onClick={() => setIsOpen((prev: boolean) => !prev)}
    >
      <input
        type="text"
        className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-muted-foreground/30 cursor-pointer"
        placeholder={placeholder}
        value={searchQuery || value}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (!searchQuery) setIsOpen(true);
        }}
      />
      <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
    </div>
  );
}

export function ComboboxContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = React.useContext(ComboboxContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-2 bg-[#1a1a2e] border border-white/5 shadow-2xl overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ComboboxEmpty({ children }: { children: React.ReactNode }) {
  const { filteredItems } = React.useContext(ComboboxContext);
  if (filteredItems.length !== 0) return null;
  return <div className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground font-black">{children}</div>;
}

export function ComboboxList({ children }: { children: (item: string) => React.ReactNode }) {
  const { filteredItems } = React.useContext(ComboboxContext);
  return <div className="max-h-60 overflow-y-auto">{filteredItems.map(children)}</div>;
}

export function ComboboxItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { handleSelect, value: currentValue } = React.useContext(ComboboxContext);
  const isSelected = currentValue === value;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-colors ${
        isSelected ? "bg-accent-purple text-white" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
      onClick={() => handleSelect(value)}
    >
      {children}
      {isSelected && <Check className="w-3 h-3" />}
    </div>
  );
}
