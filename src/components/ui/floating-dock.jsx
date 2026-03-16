"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
    itemClassName,
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} itemClassName={itemClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} itemClassName={itemClassName} />
        </>
    );
};

const FloatingDockMobile = ({
    items,
    className,
    itemClassName,
}) => {
    return (
        <div className={cn("flex md:hidden items-center gap-3", className)}>
            {items.map((item) => (
                <a
                    key={item.title}
                    href={item.onClick ? undefined : item.href}
                    onClick={(e) => { if (item.onClick) { e.preventDefault(); item.onClick(); } }}
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors", itemClassName || "bg-gray-100 hover:bg-gray-200")}
                    title={item.title}
                >
                    <div className="h-4 w-4">{item.icon}</div>
                </a>
            ))}
        </div>
    );
};

const FloatingDockDesktop = ({
    items,
    className,
    itemClassName,
}) => {
    let mouseX = useMotionValue(Infinity);
    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto hidden h-16 items-end gap-4 rounded-2xl px-4 pb-3 md:flex",
                className,
            )}
        >
            {items.map((item) => (
                <IconContainer mouseX={mouseX} key={item.title} itemClassName={itemClassName} {...item} />

            ))}
        </motion.div>
    );
};

function IconContainer({
    mouseX,
    title,
    icon,
    href,
    onClick: onClickHandler,
    itemClassName,
}) {
    let ref = useRef(null);

    let distance = useTransform(mouseX, (val) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    let heightTransformIcon = useTransform(
        distance,
        [-150, 0, 150],
        [20, 40, 20],
    );

    let width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    let widthIcon = useSpring(widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let heightIcon = useSpring(heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    const [hovered, setHovered] = useState(false);

    return (
        <a href={onClickHandler ? undefined : href} onClick={(e) => { if (onClickHandler) { e.preventDefault(); onClickHandler(); } }}>
            <motion.div
                ref={ref}
                style={{ width, height }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn("relative flex aspect-square items-center justify-center rounded-full transition-colors", itemClassName || "bg-gray-200 dark:bg-neutral-800")}

            >
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    style={{ width: widthIcon, height: heightIcon }}
                    className="flex items-center justify-center"
                >
                    {icon}
                </motion.div>
            </motion.div>
        </a>
    );
}
