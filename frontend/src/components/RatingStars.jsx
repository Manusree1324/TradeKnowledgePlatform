import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, onSelect, label = 'Rate this tutorial' }) {
  return (
    <div className={`rating-stars ${onSelect ? '' : 'is-readonly'}`} role={onSelect ? 'group' : 'img'} aria-label={onSelect ? label : `${Number(value).toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => onSelect ? (
        <button key={star} type="button" className="star-button" aria-label={`${star} star${star === 1 ? '' : 's'}`} onClick={() => onSelect(star)}>
          <Star size={19} fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ) : <Star key={star} size={16} fill={star <= Math.round(value) ? 'currentColor' : 'none'} />)}
    </div>
  );
}