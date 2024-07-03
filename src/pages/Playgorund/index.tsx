interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

const Playground = ({...props}: PlaygroundProps) => {
  return (
    <div className=" w-full h-full" {...props}>Playground</div>
  )
}

export default Playground