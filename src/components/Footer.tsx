interface FooterProps {
  totalUnits: number;
}

const Footer = ({ totalUnits }: FooterProps) => {
  return (
    <footer className="h-10 border-t border-border bg-card px-6 flex items-center shrink-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>تعداد واحد:</span>
        <span className="font-bold text-foreground">{totalUnits}</span>
      </div>
    </footer>
  );
};

export default Footer;
