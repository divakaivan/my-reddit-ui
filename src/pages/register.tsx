import React from "react";
import {Form, Formik} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/core/dist";
import {useMutation} from "urql";

interface registerProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password: String!) {
  register(options: {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }  
}`;

const Register: React.FC<registerProps> = ({}) => {
    const [{}] = useMutation(REGISTER_MUT);

    return (
        <Wrapper variant="small">
            <Formik initialValues={{username: "", password: ""}} onSubmit={values => console.log(values)}>
                {({isSubmitting}) => (
                    <Form>
                        <InputField name="username" placeholder="username" label="Username"/>
                        <Box mt={4}>
                            <InputField name="password" placeholder="password" label="Password" type="password"/>
                        </Box>
                        <Button variantColor="teal" isLoading={isSubmitting} mt={4} type="submit">Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Register;