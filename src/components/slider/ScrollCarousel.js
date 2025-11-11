"use client";
import Image from "next/image";

export default function ScrollCarousel({ items }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 px-4 pb-4 snap-x snap-mandatory">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="min-w-[250px] flex-shrink-0 snap-start rounded-2xl shadow-md bg-white"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={250}
              height={250}
              className="rounded-t-2xl"
            />
            <div className="p-2">
              <h3 className="text-sm font-medium">{item.title || item.alt}</h3>
              {item.description && (
                <p className="text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
