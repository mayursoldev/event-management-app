import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Pagination, Button, Nav } from "react-bootstrap";
import { PlusCircle, PenTool, Trash, UserPlus } from 'react-feather';
import GlobalContext from "../context/GlobalContext";
import AddEventModal from "./AddEventModal";
import { FetchLocations } from "../service/location-service";
import { formatDate } from "../common/commonMethods";
import { deleteEvent, registerForEvent } from "../service/event-service";
import RegisteredEvents from "./MyRegistrations";
import AdminRegistrations from "./AdminRegistrations";

function Home() {
  const { events, fetchEvents, user } = useContext(GlobalContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ date: "", category: "", location: "" });
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [rowData, setRowdata] = useState();
  const [generalEvents, setGeneralEvents] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const eventsPerPage = 6;
  const userRole = user.role;

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, [events, fetchEvents]);

  const handleAddEvent = async () => {
    let locationData = await FetchLocations(user);
    setAvailableLocations(locationData);
    setShowAddEventModal(true);
  };

  const handleCloseModal = () => setShowAddEventModal(false);

  const handleEdit = async (e) => {
    let locationData = await FetchLocations(user);
    setAvailableLocations(locationData);
    e.date = formatDate(e.date);
    setRowdata(e);
    setShowAddEventModal(true);
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm("Do you really want to delete Event?")) {
      const result = await deleteEvent(eventId, eventTitle);
      alert(result.message);
    }
  };

  const handleRegister = async (user, event) => {
    if (window.confirm(`Are you sure you want to register for event '${event.title}'?`)) {
      const result = await registerForEvent(user.id, event.id, event.title);
      alert(result.message);
    }
  };

  const filteredEvents = events.filter((event) => {
    return (
      (!filters.date || event.date.includes(filters.date)) &&
      (!filters.category || event.category.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.location || event.location.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  const handleMyRegistrations= async () =>{
        setGeneralEvents(false)
      }
    
      const handleShowHome = () => {
        setGeneralEvents(true)
      }

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage((prevPage) => prevPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prevPage) => prevPage - 1);

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="bg-light p-3 border-end">
          <Nav className="flex-column">
            <Nav.Link active={activeTab === "dashboard"} onClick={() => userRole == 'admin' ? setActiveTab("dashboard"): setGeneralEvents(true)}>Dashboard</Nav.Link>
            <Nav.Link active={activeTab === "registrations"} onClick={() => userRole == 'admin' ? setActiveTab("registrations") : handleMyRegistrations()}>Registrations</Nav.Link>
          </Nav>
        </Col>

        <Col md={10} className="p-4">
          {activeTab === "dashboard" ? (
            <>
              <h1 className="mb-4 text-center">
                {userRole === "admin" ? "Admin Dashboard" : (generalEvents ? "Events" : "My Registered Events")}
              </h1>
            
      <Card className="mb-4 p-3 shadow-sm">
        <Row className="align-items-center">
          <Col md={3}>
            <Form.Floating>
              <Form.Control
                type="date"
                placeholder="Filter by Date"
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
              <Form.Label>Date</Form.Label>
            </Form.Floating>
          </Col>
          <Col md={3}>
            <Form.Floating>
              <Form.Control
                type="text"
                placeholder="Filter by Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
              <Form.Label>Category</Form.Label>
            </Form.Floating>
          </Col>
          <Col md={3}>
            <Form.Floating>
              <Form.Control
                type="text"
                placeholder="Filter by Location"
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <Form.Label>Location</Form.Label>
            </Form.Floating>
          </Col>
          <Col md={3} className="text-end">
            {userRole === "admin" ? (
              <Button variant="outline-success" className="d-flex align-items-center icon-hover" onClick={handleAddEvent}>
                <PlusCircle size={20} className="me-2" /> Add New Event
              </Button>
            ) : (
              <>
                {generalEvents ? (
                  <Button variant="outline-maroon" className="d-flex align-items-center icon-hover" style={{ color: '#800000', borderColor: '#800000' }} onClick={handleMyRegistrations}>
                    My Registrations
                  </Button>
                ) : (
                  <Button variant="outline-primary" className="d-flex align-items-center icon-hover" onClick={handleShowHome}>
                    Home
                  </Button>
                )}
              </>
            )}
          </Col>
        </Row>
      </Card>

      {generalEvents ?  (
        <Card className="p-3 shadow-sm">
          <Row xs={1} md={2} lg={3} className="g-4">
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <Col key={event.id}>
                  <Card className="shadow-sm border-0 hover-effect">
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        {event.title}
                        {userRole === "admin" ? (
                          <span>
                            <PenTool size={20} className="text-warning me-2 cursor-pointer icon-hover" title="Edit Event" onClick={(e) => handleEdit(event)} />
                            <Trash size={20} className="text-danger cursor-pointer icon-hover" title="Delete Event" onClick={(e) => handleDelete(event.id, event.title)} />
                          </span>
                        ) : (
                            <UserPlus size={15} className="text-success me-2 cursor-pointer icon-hover"  onClick={(e) => handleRegister(user, event)} /> 
                          
                        )}
                      </Card.Title>
                      <Card.Text>{event.description}</Card.Text>
                      <Card.Text><strong>Date:</strong> {formatDate(event.date)}</Card.Text>
                      <Card.Text><strong>Location:</strong> {event.location}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <AdminRegistrations/>
            )}
          </Row>
        </Card>
      ) : (
        <RegisteredEvents user={user}/>
      )}

      {filteredEvents.length > eventsPerPage && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      <AddEventModal show={showAddEventModal} handleClose={handleCloseModal} availableLocations={availableLocations} user={user} rowData={rowData} />
            </>
          ) : (
            <AdminRegistrations/>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
