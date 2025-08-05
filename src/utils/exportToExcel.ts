import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportStudentsToExcel = (students: any[]) => {
  const exportData = students.map(student => ({
    'Scholar Number': student.student_id,
    'First Name': student.first_name,
    'Last Name': student.last_name,
    'Class': student.class_grade,
    'Section': student.section,
    'Parent Name': student.parent_name,
    'Parent Phone': student.parent_phone,
    'Parent Email': student.parent_email || '',
    'Email': student.email || '',
    'Address': student.address || '',
    'Date of Birth': student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '',
    'Admission Date': student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '',
    'Enrollment Date': new Date(student.enrollment_date).toLocaleDateString(),
    'Status': student.status,
    'Aadhar Number': student.aadhar_number || '',
    'SSSM ID': student.sssm_id || '',
    'Apar ID': student.apar_id || '',
    'Account Number': student.account_number || '',
    'IFSC Code': student.ifsc_code || '',
    'Bank Account Name': student.bank_account_name || ''
  }));
  
  return exportToExcel(exportData, 'students-data', 'Students');
};

export const exportFeesDataToExcel = (feesData: any[]) => {
  const exportData = feesData.map(record => ({
    'Student Name': `${record.students.first_name} ${record.students.last_name}`,
    'Scholar Number': record.students.student_id,
    'Class': `${record.students.class_grade}-${record.students.section}`,
    'Total Amount': record.total_amount,
    'Paid Amount': record.paid_amount,
    'Outstanding Amount': record.outstanding_amount,
    'Status': record.status,
    'Due Date': record.due_date ? new Date(record.due_date).toLocaleDateString() : '',
    'Parent Name': record.students.parent_name,
    'Parent Phone': record.students.parent_phone
  }));
  
  return exportToExcel(exportData, 'student-fees-data', 'Student Fees');
};

export const exportDefaultersToExcel = (defaulters: any[]) => {
  const exportData = defaulters.map(record => ({
    'Student Name': `${record.students.first_name} ${record.students.last_name}`,
    'Scholar Number': record.students.student_id,
    'Class': `${record.students.class_grade}-${record.students.section}`,
    'Parent Name': record.students.parent_name,
    'Parent Phone': record.students.parent_phone,
    'Parent Email': record.students.parent_email || '',
    'Total Fees': record.total_amount,
    'Paid Amount': record.paid_amount,
    'Outstanding Amount': record.outstanding_amount,
    'Due Date': record.due_date ? new Date(record.due_date).toLocaleDateString() : '',
    'Days Overdue': record.due_date ? Math.max(0, Math.ceil((new Date().getTime() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24))) : 0
  }));
  
  return exportToExcel(exportData, 'defaulters-list', 'Defaulters');
};