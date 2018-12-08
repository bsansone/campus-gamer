import React, { Component } from "react";

// Components
import SignupForm from "./SignupForm";

class Signup extends Component {
  render() {
    return (
      <article className="container h-full flex justify-center p-8">
        <section className="lg:w-1/3 md:w-3/5">
          <SignupForm />
        </section>
      </article>
    );
  }
}

export default Signup;
