import { useState } from "react"


const useForm = (initailState) => {
    const [form, setform] = useState(initailState);

    const handleChange=(e)=>{
        setform({...form,[e.target.name]:e.target.value});
    }

   const resetForm=()=>{setform(initailState)};
  return {form, handleChange, resetForm}
};
export default useForm;
