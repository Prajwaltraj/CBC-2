import Papa from 'papaparse';

const csvText = `Timestamp,Email Address,College Name:,Team Name:,Team Size:,Domain:,Team Leader's Name:,WhatsApp Number:,Email ID:,Team Member 2 Name:,Team Member 2 WhatsApp Number:,Team Member 2 Email ID:,Team Member 2 College Name:,Team Member 3 Name:,Team Member 3 WhatsApp Number:,Team Member 3 Email ID:,Team Member 3 College Name:,Team Member 4 Name:,Team Member 4 WhatsApp Number:,Team Members 4 Email ID:,Team Member 4 College Name:,Upload File Max 10MB,Transaction/UTR Number:,"Payment Screenshot"
9/22/2026 15:56:18,ambikaalure2006@gmail.com,Global Academy of Technology ,QuadCore AI,4,Artificial Intelligence (AI) & Machine Learning (ML),Bhoomika Hallur,8660608469,hallurbhoomika@gmail.com,Ambika Alure,9741342134,ambikaalure2006@gmail.com,Global academy of technology,Chandanashree K,7204768799,cc1340975@gmail.com,Global academy of technology,Tuvithanand,7483975929,tuvithaanand@gmail.com,Global academy of Technology,https://drive.google.com/open?id=1SxqBV_YEg8-Lbmf1wmWGbxRmTaxxXLD5,744157233789,https://drive.google.com/open?id=17PHwCDIULDzD-AmStNHkcivVj2DeZD6D`;

Papa.parse(csvText, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    console.log(Object.keys(results.data[0]));
    console.log("Team Member 3 Email ID: value ->", results.data[0]['Team Member 3 Email ID:']);
  }
});
