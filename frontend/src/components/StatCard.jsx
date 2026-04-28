const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 md:space-x-6 transform transition-transform hover:scale-105 hover:shadow-md cursor-pointer">
      {/* Icon Area colored purely by the props */}
      <div className={`p-3 md:p-4 rounded-full text-white ${colorClass || 'bg-blue-500'}`}>
        {Icon && <Icon size={24} className="md:size-28" />}
      </div>

      {/* Text Area */}
      <div>
        <p className="text-slate-500 text-xs md:text-sm font-medium tracking-wide">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;
