# astro-html

Integration for Astro to Generate HTML emails with React ([react-email](https://github.com/resend/react-email)).

## Installation

```sh
npm i astro-html
```

## Usage

```javascript
import { defineConfig } from "astro/config";
import email from "astro-html";

// https://astro.build/config
export default defineConfig({
  integrations: [
    email({
      filename: "[name].html",
    }),
  ],
});
```

### Development

```sh
npx astro dev
```

Development preview with live reload.

### Production

```sh
npx astro build
```

This will generate HTML files for each `.astro` file in the `src/pages` directory.

## Example

```astro
---
// Important! Without partial astro will render the default Doctype.
export const partial = true;

import * as React from "react";
import { Body, Container, Heading, Link, Text } from "@react-email/components";
import Mail from "astro-html/Mail.astro";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

const container: React.CSSProperties = {
  paddingLeft: "45px",
  paddingRight: "45px",
  margin: "0 auto",
  maxWidth: "640px",
};
---

<Mail>
  <Body
    style={{
      fontFamily,
      backgroundColor: "#ffffff",
      margin: "0",
    }}
  >
    <Container style={container}>
      <Heading>My Email</Heading>
      <Text>Lorem Ipsum</Text>

      <Link href="https://example.com">Click me</Link>
    </Container>
  </Body>
</Mail>

```
