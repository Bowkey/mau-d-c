import Image from "next/image"

function HeaderLogo() {
  return (
    <div>
      <Image
      
      src='logo.svg'
      alt="main-logo"
      width={200}
      height={200}/>
      

    </div>
  )
}

export default HeaderLogo