import { useState } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';

const StarRating = ({ rating, hoverRating, onSetRating, onHoverRating }) => {
  // 💡 Beginner Note: This maps an array [1,2,3,4,5] so we easily render 5 stars
  const starsArray = [...Array(5)].map((_, index) => index + 1);

  return (
    <div className="flex space-x-2 my-4">
      {starsArray.map((starNum) => {
        // Star should be filled if either its rating is <= the saved rating, OR <= the current mouse hover
        const isFilled = starNum <= (hoverRating || rating);
        return (
          <button
            key={starNum}
            type="button"
            className="focus:outline-none transform transition-transform hover:scale-125"
            onClick={() => onSetRating(starNum)}
            onMouseEnter={() => onHoverRating(starNum)}
            onMouseLeave={() => onHoverRating(0)}
          >
            {isFilled ? (
              <MdStar className="text-yellow-400 drop-shadow-sm" size={40} />
            ) : (
              <MdStarBorder className="text-slate-300 hover:text-yellow-200" size={40} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
