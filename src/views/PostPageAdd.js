import React, { useEffect, useState } from "react";
import { Button, Container, Form, Nav, Navbar, Image } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState} from "react-firebase-hooks/auth";
import { useNavigate} from "react-router-dom";
import { auth, db, storage} from "../firebase";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function PostPageAdd() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState("https://picsum.photos/id/10/600");


  async function addPost() {
    const imageReference = ref(storage, `images/${image.name}`);
    const response = await uploadBytes(imageReference, image);
    const imageUrl = await getDownloadURL(response.ref);
    await addDoc(collection(db, "posts"), {caption, image: imageUrl, imageName: imageName});
    navigate("/");
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/login");
  }, [loading, user, navigate]);

  return (
    <>
      <Navbar variant="light" bg="light">
        <Container>
          <Navbar.Brand href="/">Tinkergram</Navbar.Brand>
          <Nav>
            <Nav.Link href="/add">New Post</Nav.Link>
            <Nav.Link onClick={(e) => signOut(auth)}>🚪Sign out</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <h1 style={{ marginBlock: "1rem" }}>Add Post</h1>
        <Form>
          <Form.Group className="mb-3" controlId="caption">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              type="text"
              placeholder="Lovely day"
              value={caption}
              onChange={(text) => setCaption(text.target.value)}
            />
          </Form.Group>
          
          <Image src={previewImage} style={{width: "10rem", objectFit: "cover", height : "10rem"}} />

          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                const imageFile = e.target.files[0];
                setImage(imageFile)
                const previewImage = URL.createObjectURL(imageFile);
                setPreviewImage(previewImage);
                setImageName(imageFile.name);
              }}
            />
            <Form.Text className="text-muted">
              Make sure the url has a image type at the end: jpg, jpeg, png.
            </Form.Text>
          </Form.Group>
          <Button variant="primary" onClick={async (e) => addPost()}>
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}