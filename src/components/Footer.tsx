interface FooterProps {
  totalUnits: number;
  courseCount: number;
}

const Footer = ({ totalUnits, courseCount }: FooterProps) => {
  return (
    <footer className="h-[30px] border-t border-border bg-card px-4 flex items-center justify-between shrink-0 text-[11px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>تعداد دروس:</span>
          <span className="font-bold text-foreground">{courseCount}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>مجموع واحد:</span>
          <span className="font-bold text-foreground">{totalUnits}</span>
        </div>
      </div>
      <div className="text-muted-foreground">
        نسخه ۱.۰.۰
      </div>
    </footer>
  );
};

export default Footer;