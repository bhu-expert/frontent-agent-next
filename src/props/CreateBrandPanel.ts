/**
 * CreateBrandPanel Component Props
 */
export interface CreateBrandPanelProps {
  isOpen: boolean;
  onBrandCreated: (brandId: string) => void;
  onClose: () => void;
}
