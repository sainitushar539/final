import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingCTAProps {
  title?: string;
  subtitle?: string;
  showFundability?: boolean;
}

const BookingCTA = ({ title = 'Book a Free Strategy Call', subtitle, showFundability = true }: BookingCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 mt-6">
      <button
        onClick={() => window.open('https://calendly.com/mauricestewart/1-hour-consultation', '_blank')}
        className="w-full bg-gradient-to-r from-[#2563eb] to-[hsl(260,70%,60%)] text-white border-none text-sm font-semibold py-4 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {title}
      </button>
      {subtitle && <p className="text-xs text-white/30 text-center">{subtitle}</p>}
      {showFundability && (
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white/[0.06] text-white/60 border border-white/[0.1] text-sm font-medium py-3 cursor-pointer rounded-xl transition-all hover:bg-white/[0.1] hover:text-white/80 flex items-center justify-center gap-2"
        >
          Back to Home <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default BookingCTA;
