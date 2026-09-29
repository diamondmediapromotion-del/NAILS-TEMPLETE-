import { Service } from '@/types';
import { Clock, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:shadow-lifted transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {service.popular && (
          <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg mb-1">{service.name}</h3>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <DollarSign className="w-4 h-4" />
            <span>{service.price}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/service/${service.id}`)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            onClick={() => navigate(`/book?service=${service.id}`)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
