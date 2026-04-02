interface PlayButtonProps {
  onPlay: () => void
  disabled: boolean
}

export default function PlayButton(props: PlayButtonProps) {
  return (
    <button
      class="btn btn-success btn-lg"
      onClick={props.onPlay}
      disabled={props.disabled}
    >
      Play
    </button>
  )
}
