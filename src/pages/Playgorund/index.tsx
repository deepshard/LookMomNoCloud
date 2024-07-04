interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

const Playground = ({...props}: PlaygroundProps) => {
  return (
    <div {...props}>Playground</div>
  )
}

export default Playground