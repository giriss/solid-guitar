interface CapoSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function CapoSelector(props: CapoSelectorProps) {
  return (
    <div class="w-full max-w-xs flex flex-col gap-2 mb-4">
      <div class="flex justify-between items-center">
        <span class="label-text">Capo Position</span>
        <span class="font-bold text-primary">
          {props.value === 0 ? "No Capo" : `Fret ${props.value}`}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="11"
        step="1"
        value={props.value}
        class="range range-primary"
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value))}
      />
      <div class="flex justify-between px-2.5 mt-2 text-xs">
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
      </div>
      <div class="flex justify-between px-2.5 mt-2 text-xs">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>10</span>
        <span>11</span>
      </div>
    </div>
  )
}
