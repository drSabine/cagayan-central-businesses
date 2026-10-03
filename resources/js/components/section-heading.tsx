type Props = {
    id?: string;
    label: string;
    description?: string;
};

// The orange eyebrow above a ruled grid (design.md, "Ruled grid"). No other heading decoration.
export function SectionHeading({ id, label, description }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <h2 id={id} className="type-label">
                {label}
            </h2>
            {description && <p className="type-meta">{description}</p>}
        </div>
    );
}
