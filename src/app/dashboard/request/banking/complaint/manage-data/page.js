import ComplaintList from "@/components/form/ComplaintList";
import { BrowserRouter as Router } from 'react-router';

function ViewData() {
  return (
    <div>
      <Router>
        <ComplaintList />
      </Router>
    </div>
  );
}

export default ViewData;
